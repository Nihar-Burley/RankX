package com.application.authservice.service;

import com.application.authservice.entity.AuthUsers;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

class JwtServiceTest {

    private static final String SECRET = Base64.getEncoder()
            .encodeToString("rankx-production-grade-jwt-secret-for-tests-2026".getBytes(StandardCharsets.UTF_8));

    private final JwtService jwtService = new JwtService();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
    }

    @ParameterizedTest(name = "generated token should contain subject and role for {0}")
    @MethodSource("tokenProfiles")
    void generateTokenShouldEmbedSubjectAndRole(String username, String role) {
        AuthUsers user = AuthUsers.builder()
                .id(UUID.randomUUID())
                .username(username)
                .password("encoded")
                .mobile("9000000000")
                .role(role)
                .enabled(true)
                .build();

        String token = jwtService.generateToken(user);
        Claims claims = parseClaims(token);

        assertThat(claims.getSubject()).isEqualTo(user.getId().toString());
        assertThat(claims.get("role", String.class)).isEqualTo(role);
    }

    @ParameterizedTest(name = "generated token should keep production-style timestamps for {0}")
    @MethodSource("tokenProfiles")
    void generateTokenShouldSetIssuedAtAndExpiration(String username, String role) {
        AuthUsers user = AuthUsers.builder()
                .id(UUID.randomUUID())
                .username(username)
                .password("encoded")
                .mobile("9000000000")
                .role(role)
                .enabled(true)
                .build();

        Date before = new Date();
        String token = jwtService.generateToken(user);
        Date after = new Date();
        Claims claims = parseClaims(token);

        assertThat(Math.abs(claims.getIssuedAt().getTime() - after.getTime())).isLessThanOrEqualTo(2_000L);
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
        assertThat(Duration.between(claims.getIssuedAt().toInstant(), claims.getExpiration().toInstant()).toHours())
                .isBetween(23L, 24L);
    }

    private Claims parseClaims(String token) {
        Key key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private static Stream<Arguments> tokenProfiles() {
        return Stream.of(
                arguments("alpha-user", "ROLE_USER"),
                arguments("beta-user", "ROLE_USER"),
                arguments("gamma-admin", "ROLE_ADMIN"),
                arguments("delta-mentor", "ROLE_MENTOR"),
                arguments("epsilon-reviewer", "ROLE_REVIEWER"),
                arguments("zeta-ops", "ROLE_OPS")
        );
    }
}
