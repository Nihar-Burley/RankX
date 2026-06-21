package com.application.authservice.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocalAuthBootstrapUsers implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Value("${local.auth.bootstrap.enabled:false}")
    private boolean enabled;

    @Value("${local.auth.bootstrap.admin.user-id:00000000-0000-0000-0000-000000000101}")
    private UUID adminUserId;

    @Value("${local.auth.bootstrap.admin.username:rankx_admin}")
    private String adminUsername;

    @Value("${local.auth.bootstrap.admin.password:RankXAdmin123!}")
    private String adminPassword;

    @Value("${local.auth.bootstrap.admin.mobile:9000000001}")
    private String adminMobile;

    @Value("${local.auth.bootstrap.test.user-id:00000000-0000-0000-0000-000000000102}")
    private UUID testUserId;

    @Value("${local.auth.bootstrap.test.username:rankx_test}")
    private String testUsername;

    @Value("${local.auth.bootstrap.test.password:RankXTest123!}")
    private String testPassword;

    @Value("${local.auth.bootstrap.test.mobile:9000000002}")
    private String testMobile;

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        upsertUser(adminUserId, adminUsername, adminPassword, adminMobile, "ROLE_ADMIN");
        upsertUser(testUserId, testUsername, testPassword, testMobile, "ROLE_USER");

        log.info("Local auth bootstrap ensured users: {}, {}", adminUsername, testUsername);
    }

    private void upsertUser(UUID userId, String username, String rawPassword, String mobile, String role) {
        jdbcTemplate.update(
                "DELETE FROM auth_users WHERE username = ? AND id <> UUID_TO_BIN(?)",
                username,
                userId.toString()
        );
        jdbcTemplate.update(
                "DELETE FROM auth_users WHERE mobile = ? AND id <> UUID_TO_BIN(?)",
                mobile,
                userId.toString()
        );

        jdbcTemplate.update(
                """
                INSERT INTO auth_users (id, username, password, mobile, role, enabled)
                VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    password = VALUES(password),
                    mobile = VALUES(mobile),
                    role = VALUES(role),
                    enabled = VALUES(enabled)
                """,
                userId.toString(),
                username,
                passwordEncoder.encode(rawPassword),
                mobile,
                role,
                true
        );
    }
}
