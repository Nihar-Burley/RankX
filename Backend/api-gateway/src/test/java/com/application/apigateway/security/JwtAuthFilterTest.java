package com.application.apigateway.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JwtAuthFilterTest {

    private final JwtUtil jwtUtil = Mockito.mock(JwtUtil.class);
    private final JwtAuthFilter filter = new JwtAuthFilter(jwtUtil);

    @ParameterizedTest(name = "auth path {0} should bypass jwt auth")
    @MethodSource("authBypassPaths")
    void shouldBypassAuthenticationForAuthEndpoints(String path) {
        RecordingChain chain = new RecordingChain();
        MockServerWebExchange exchange = exchange(HttpMethod.GET, path, null);

        filter.filter(exchange, chain).block();

        assertThat(chain.calls).isEqualTo(1);
        assertThat(exchange.getResponse().getStatusCode()).isNull();
        verify(jwtUtil, never()).isTokenValid(Mockito.anyString());
    }

    @ParameterizedTest(name = "OPTIONS request {0} should bypass jwt auth")
    @MethodSource("optionsBypassPaths")
    void shouldBypassAuthenticationForOptionsRequests(String path) {
        RecordingChain chain = new RecordingChain();
        MockServerWebExchange exchange = exchange(HttpMethod.OPTIONS, path, null);

        filter.filter(exchange, chain).block();

        assertThat(chain.calls).isEqualTo(1);
        assertThat(exchange.getResponse().getStatusCode()).isNull();
        verify(jwtUtil, never()).isTokenValid(Mockito.anyString());
    }

    @ParameterizedTest(name = "protected request should reject invalid authorization header variant {0}")
    @MethodSource("invalidAuthorizationHeaders")
    void shouldRejectMissingOrMalformedAuthorizationHeader(
            String label,
            String headerValue,
            String expectedMessage,
            boolean expectTokenValidation
    ) {
        RecordingChain chain = new RecordingChain();
        MockServerWebExchange exchange = exchange(HttpMethod.GET, "/api/problems/101", headerValue);

        filter.filter(exchange, chain).block();

        assertThat(chain.calls).isZero();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(exchange.getResponse().getBodyAsString().block()).contains(expectedMessage);
        if (expectTokenValidation) {
            verify(jwtUtil).isTokenValid(Mockito.anyString());
        } else {
            verify(jwtUtil, never()).isTokenValid(Mockito.anyString());
        }
    }

    @ParameterizedTest(name = "protected request should reject invalid token variant {0}")
    @MethodSource("invalidTokens")
    void shouldRejectInvalidTokens(String token) {
        when(jwtUtil.isTokenValid(token)).thenReturn(false);

        RecordingChain chain = new RecordingChain();
        MockServerWebExchange exchange = exchange(HttpMethod.GET, "/api/submissions/history", "Bearer " + token);

        filter.filter(exchange, chain).block();

        assertThat(chain.calls).isZero();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(exchange.getResponse().getBodyAsString().block()).contains("Invalid token");
    }

    @ParameterizedTest(name = "protected request should reject token with subject {0} and role {1}")
    @MethodSource("missingClaimScenarios")
    void shouldRejectTokensMissingRequiredClaims(String subject, String role) {
        String token = "token-" + subject + "-" + role;
        Claims claims = Mockito.mock(Claims.class);
        when(jwtUtil.isTokenValid(token)).thenReturn(true);
        when(jwtUtil.extractClaims(token)).thenReturn(claims);
        when(claims.getSubject()).thenReturn(subject);
        when(claims.get("role", String.class)).thenReturn(role);

        RecordingChain chain = new RecordingChain();
        MockServerWebExchange exchange = exchange(HttpMethod.GET, "/api/results/attempt/1", "Bearer " + token);

        filter.filter(exchange, chain).block();

        assertThat(chain.calls).isZero();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(exchange.getResponse().getBodyAsString().block()).contains("Token is missing required claims");
    }

    @ParameterizedTest(name = "valid token should forward user {0} with role {1}")
    @MethodSource("validClaimScenarios")
    void shouldForwardUserAndRoleClaimsToDownstreamRequest(String userId, String role, String path) {
        String token = userId + ":" + role;
        Claims claims = Mockito.mock(Claims.class);
        when(jwtUtil.isTokenValid(token)).thenReturn(true);
        when(jwtUtil.extractClaims(token)).thenReturn(claims);
        when(claims.getSubject()).thenReturn(userId);
        when(claims.get("role", String.class)).thenReturn(role);

        RecordingChain chain = new RecordingChain();
        MockServerWebExchange exchange = exchange(HttpMethod.GET, path, "Bearer " + token);

        filter.filter(exchange, chain).block();

        assertThat(chain.calls).isEqualTo(1);
        assertThat(chain.lastExchange.getRequest().getHeaders().getFirst("X-User-Id")).isEqualTo(userId);
        assertThat(chain.lastExchange.getRequest().getHeaders().getFirst("X-Role")).isEqualTo(role);
        assertThat(chain.lastExchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION)).isEqualTo("Bearer " + token);
    }

    private static Stream<String> authBypassPaths() {
        return Stream.of(
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/verify-otp",
                "/api/auth/password/reset",
                "/api/auth/profile"
        );
    }

    private static Stream<String> optionsBypassPaths() {
        return Stream.of(
                "/api/problems/101",
                "/api/quizzes",
                "/api/results/attempt/1",
                "/api/submissions/run"
        );
    }

    private static Stream<Arguments> invalidAuthorizationHeaders() {
        return Stream.of(
                arguments("missing", null, "Missing or invalid Authorization header", false),
                arguments("blank", "", "Missing or invalid Authorization header", false),
                arguments("token-without-bearer", "token", "Missing or invalid Authorization header", false),
                arguments("basic-auth", "Basic abc123", "Missing or invalid Authorization header", false),
                arguments("bearer-without-token", "Bearer ", "Invalid token", true),
                arguments("wrong-prefix", "Token value", "Missing or invalid Authorization header", false)
        );
    }

    private static Stream<String> invalidTokens() {
        return Stream.of(
                "expired-token",
                "tampered-token",
                "malformed-token",
                "wrong-secret-token",
                "empty-claims-token"
        );
    }

    private static Stream<Arguments> missingClaimScenarios() {
        return Stream.of(
                arguments(null, "ROLE_USER"),
                arguments("", "ROLE_USER"),
                arguments("00000000-0000-0000-0000-000000000102", null),
                arguments("00000000-0000-0000-0000-000000000102", "")
        );
    }

    private static Stream<Arguments> validClaimScenarios() {
        return Stream.of(
                arguments("00000000-0000-0000-0000-000000000101", "ROLE_ADMIN", "/api/users/me"),
                arguments("00000000-0000-0000-0000-000000000102", "ROLE_USER", "/api/problems/101"),
                arguments("00000000-0000-0000-0000-000000000103", "ROLE_USER", "/api/problems/118"),
                arguments("00000000-0000-0000-0000-000000000104", "ROLE_USER", "/api/quizzes"),
                arguments("00000000-0000-0000-0000-000000000105", "ROLE_USER", "/api/questions/quiz/12121212-1212-1212-1212-121212121212"),
                arguments("00000000-0000-0000-0000-000000000106", "ROLE_USER", "/api/attempts"),
                arguments("00000000-0000-0000-0000-000000000107", "ROLE_USER", "/api/results/history"),
                arguments("00000000-0000-0000-0000-000000000108", "ROLE_USER", "/api/submissions")
        );
    }

    private static MockServerWebExchange exchange(HttpMethod method, String path, String authorizationHeader) {
        MockServerHttpRequest.BaseBuilder<?> requestBuilder = MockServerHttpRequest.method(method, path);
        if (authorizationHeader != null) {
            requestBuilder.header(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }
        return MockServerWebExchange.from(requestBuilder.build());
    }

    private static final class RecordingChain implements GatewayFilterChain {
        private int calls;
        private ServerWebExchange lastExchange;

        @Override
        public Mono<Void> filter(ServerWebExchange exchange) {
            this.calls++;
            this.lastExchange = exchange;
            return Mono.empty();
        }
    }
}
