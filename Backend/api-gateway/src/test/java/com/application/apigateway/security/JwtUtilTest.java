package com.application.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

class JwtUtilTest {

    private static final String SECRET = Base64.getEncoder()
            .encodeToString("rankx-production-grade-jwt-secret-key-1234567890"
                    .getBytes(StandardCharsets.UTF_8));

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
    }

    @ParameterizedTest(name = "extractClaims should preserve subject {0} and role {1}")
    @MethodSource("validTokenScenarios")
    void extractClaimsShouldReturnSubjectAndRole(String subject, String role, long expirationMinutes) {
        String token = token(subject, role, signingKey(SECRET), Instant.now().plus(expirationMinutes, ChronoUnit.MINUTES));

        Claims claims = jwtUtil.extractClaims(token);

        assertThat(claims.getSubject()).isEqualTo(subject);
        assertThat(claims.get("role", String.class)).isEqualTo(role);
    }

    @ParameterizedTest(name = "isTokenValid should accept live token for {0}")
    @MethodSource("validTokenScenarios")
    void isTokenValidShouldAcceptValidTokens(String subject, String role, long expirationMinutes) {
        String token = token(subject, role, signingKey(SECRET), Instant.now().plus(expirationMinutes, ChronoUnit.MINUTES));

        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @ParameterizedTest(name = "isTokenValid should reject invalid token variant {0}")
    @MethodSource("invalidTokens")
    void isTokenValidShouldRejectInvalidTokens(String label, String token) {
        assertThat(jwtUtil.isTokenValid(token)).isFalse();
    }

    private static Stream<Arguments> validTokenScenarios() {
        return Stream.of(
                arguments("00000000-0000-0000-0000-000000000101", "ROLE_ADMIN", 30L),
                arguments("00000000-0000-0000-0000-000000000102", "ROLE_USER", 30L),
                arguments("00000000-0000-0000-0000-000000000103", "ROLE_MENTOR", 45L),
                arguments("rankx-admin", "ROLE_ADMIN", 60L),
                arguments("rankx-test", "ROLE_USER", 90L),
                arguments("platform-ops", "ROLE_ADMIN", 120L),
                arguments("candidate-a", "ROLE_USER", 15L),
                arguments("candidate-b", "ROLE_USER", 20L),
                arguments("candidate-c", "ROLE_USER", 25L),
                arguments("coach-1", "ROLE_MENTOR", 50L),
                arguments("coach-2", "ROLE_MENTOR", 55L),
                arguments("qa-user", "ROLE_USER", 35L)
        );
    }

    private static Stream<Arguments> invalidTokens() {
        SecretKey otherKey = signingKey(Base64.getEncoder()
                .encodeToString("different-rankx-jwt-secret-key-0987654321".getBytes(StandardCharsets.UTF_8)));
        Instant now = Instant.now();
        String validToken = token("rankx-test", "ROLE_USER", signingKey(SECRET), now.plus(30, ChronoUnit.MINUTES));
        return Stream.of(
                arguments("blank", ""),
                arguments("garbage", "not-a-jwt"),
                arguments("truncated", "abc.def"),
                arguments("tampered-signature", validToken.substring(0, validToken.length() - 2) + "zz"),
                arguments("wrong-signing-key", token("rankx-test", "ROLE_USER", otherKey, now.plus(30, ChronoUnit.MINUTES))),
                arguments("expired", token("rankx-test", "ROLE_USER", signingKey(SECRET), now.minus(5, ChronoUnit.MINUTES)))
        );
    }

    private static SecretKey signingKey(String base64Secret) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
    }

    private static String token(String subject, String role, SecretKey key, Instant expiration) {
        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(expiration))
                .signWith(key)
                .compact();
    }
}
