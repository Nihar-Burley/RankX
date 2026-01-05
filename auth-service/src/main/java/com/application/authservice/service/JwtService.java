package com.application.authservice.service;

import com.application.authservice.entity.AuthUsers;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET =
            "n7m4FJw9K9JH6v0K+K4F4A7Q9KJZ9JH1L4v9F2Q1G8E=";

    private Key getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
    }

    public String generateToken(AuthUsers user) {

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 86400000)
                )
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
