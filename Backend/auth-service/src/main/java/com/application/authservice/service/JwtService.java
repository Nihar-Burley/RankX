package com.application.authservice.service;

import com.application.authservice.entity.AuthUsers;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${security.jwt.secret:n7m4FJw9K9JH6v0K+K4F4A7Q9KJZ9JH1L4v9F2Q1G8E=}")
    private String secret;

    private Key getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateToken(AuthUsers user) {

        return Jwts.builder()
                // 🔥 PRODUCTION FIX
                .setSubject(user.getId().toString())   // UUID, NOT username

                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 86400000)
                )
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
