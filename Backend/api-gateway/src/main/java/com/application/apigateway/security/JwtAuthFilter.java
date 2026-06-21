package com.application.apigateway.security;

import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
@Slf4j
@Component
public class JwtAuthFilter implements GatewayFilter {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_ROLE = "X-Role";

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        log.info("Incoming request: path={}", path);

        if (path.startsWith("/api/auth")) {
            return chain.filter(exchange);
        }

        if ("OPTIONS".equals(exchange.getRequest().getMethod().name())) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);
        log.info("Authorization header = {}", authHeader);

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            log.info("Missing or invalid Authorization header for path={}", path);
            return unauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        log.info("Extracted JWT token = {}", token);
        log.info("Validating token...");
        if (!jwtUtil.isTokenValid(token)) {
            log.info("Invalid JWT token received for path={}", path);
            return unauthorized(exchange, "Invalid token");
        }

        Claims claims = jwtUtil.extractClaims(token);
        String userId = claims.getSubject();
        String role = claims.get("role", String.class);

        if (!StringUtils.hasText(userId) || !StringUtils.hasText(role)) {
            return unauthorized(exchange, "Token is missing required claims");
        }

        log.info("Injecting headers -> X-User-Id={}, X-Role={}", userId, role);
        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(request -> request.headers(headers -> {
                    headers.set(HEADER_USER_ID, userId);
                    headers.set(HEADER_ROLE, role);
                }))
                .build();

        return chain.filter(mutatedExchange);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = ("{\"success\":false,\"message\":\"" + message + "\"}")
                .getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse()
                .writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
    }
}
