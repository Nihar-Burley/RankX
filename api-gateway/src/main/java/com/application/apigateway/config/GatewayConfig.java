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

                // AUTH SERVICE (PUBLIC)
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://AUTH-SERVICE"))

                // PROBLEM SERVICE (PROTECTED)
                .route("problem-service", r -> r
                        .path("/api/problems/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://PROBLEM-SERVICE"))


                // PROBLEM SERVICE (PROTECTED)
                .route("submission-service", r -> r
                        .path("/api/submissions/**")
                        .filters(f -> f.filter(jwtAuthFilter))
                        .uri("lb://SUBMISSION-SERVICE"))

                .build();
    }
}
