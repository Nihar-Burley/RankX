package com.application.apigateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;   // ✅ CORRECT
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
@Component
public class JwtAuthFilter implements GatewayFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                             GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        // 1️⃣ Public endpoints
        if (path.startsWith("/api/auth")) {
            return chain.filter(exchange);
        }

        // 2️⃣ Read Authorization header
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7);

        // 3️⃣ Validate token
        if (!jwtUtil.isTokenValid(token)) {
            return unauthorized(exchange);
        }

        // 4️⃣ Extract claims
        Claims claims = jwtUtil.extractClaims(token);

        // 5️⃣ ROLE-BASED ACCESS (example)
        if (path.startsWith("/api/admin")
                && !claims.get("role").equals("ROLE_ADMIN")) {
            return forbidden(exchange);
        }

        // 6️⃣ Forward user info to downstream services
        ServerWebExchange mutatedExchange =
                exchange.mutate()
                        .request(r -> r.headers(h -> {
                            h.add("X-User", claims.getSubject());
                            h.add("X-Role", claims.get("role").toString());
                        }))
                        .build();

        return chain.filter(mutatedExchange);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private Mono<Void> forbidden(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }
}
