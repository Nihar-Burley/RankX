package com.application.apigateway.security;

import io.jsonwebtoken.Claims;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtil {

    private static final String SECRET =
            "n7m4FJw9K9JH6v0K+K4F4A7Q9KJZ9JH1L4v9F2Q1G8E=";

    private Key getKey() {
        return Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(SECRET)
        );
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

