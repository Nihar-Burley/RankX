package com.application.authservice.repository;

import com.application.authservice.entity.AuthUsers;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthUserRepository extends JpaRepository<AuthUsers, UUID> {

    Optional<AuthUsers> findByUsername(String username);
    Optional<AuthUsers> findByMobile(String mobile);
}
