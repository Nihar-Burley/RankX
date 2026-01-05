package com.application.authservice.repository;

import com.application.authservice.entity.AuthUsers;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthUserRepository extends JpaRepository<AuthUsers,Long> {

    Optional<AuthUsers> findByUsername(String username);
    Optional<AuthUsers> findByMobile(String mobile);


}
