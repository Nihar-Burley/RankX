package com.application.apigateway.config;

import com.application.apigateway.security.JwtAuthFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder,
                               JwtAuthFilter jwtAuthFilter) {



        return builder.routes()

                // ================= AUTH SERVICE (PUBLIC) =================
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://AUTH-SERVICE"))

                .route("user-service", r -> r
                        .path("/api/users/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://USER-SERVICE"))

                // ================= QUIZ SERVICE (PROTECTED) =================
                .route("quiz-service", r -> r
                        .path("/api/quizzes/**","/api/admin/quizzes/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://QUIZ-SERVICE"))

                // ================= QUESTION SERVICE (PROTECTED) =================
                .route("question-service", r -> r
                        .path(
                                "/api/questions/**",
                                "/api/admin/questions/**"
                        )
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://QUESTION-SERVICE"))

                // ================= ATTEMPT SERVICE (PROTECTED) =================
                .route("attempt-service", r -> r
                        .path("/api/attempts/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://ATTEMPT-SERVICE"))

                // ================= RESULT SERVICE (PROTECTED) =================
                .route("result-service", r -> r
                        .path("/api/results/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://RESULT-SERVICE"))

                // ================= PROBLEM SERVICE (PROTECTED) =================
                .route("problem-service", r -> r
                        .path("/api/problems/**", "/api/admin/problems/**", "/api/admin/testcases/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://PROBLEM-SERVICE"))

                // ================= SUBMISSION SERVICE (PROTECTED) =================
                .route("submission-service", r -> r
                        .path("/api/submissions/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://SUBMISSION-SERVICE"))

                .build();
    }
}
