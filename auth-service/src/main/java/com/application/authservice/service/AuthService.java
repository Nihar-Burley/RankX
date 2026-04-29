package com.application.authservice.service;

import com.application.authservice.dto.request.LoginRequest;
import com.application.authservice.dto.request.OtpRequest;
import com.application.authservice.dto.request.RegisterRequest;
import com.application.authservice.dto.response.ApiResponse;
import com.application.authservice.entity.AuthUsers;
import com.application.authservice.repository.AuthUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthService {

    private final AuthUserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthService(
            AuthUserRepository repo,
            PasswordEncoder encoder,
            JwtService jwtService,
            OtpService otpService
    ) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }

    // REGISTER
    public ApiResponse register(RegisterRequest req) {

        log.info("Register requested for username={}", req.getUsername());

        if (repo.findByUsername(req.getUsername()).isPresent()) {
            throw new IllegalStateException("Username is already registered");
        }

        if (repo.findByMobile(req.getMobile()).isPresent()) {
            throw new IllegalStateException("Mobile number is already registered");
        }

        AuthUsers user = AuthUsers.builder()
                .username(req.getUsername())
                .password(encoder.encode(req.getPassword()))
                .mobile(req.getMobile())
                .role("ROLE_USER")
                .enabled(false)
                .build();

        repo.save(user);
        otpService.generateAndSaveOtp(req.getMobile());
        return new ApiResponse(true, "Registration successful. Verify OTP to activate the account.");
    }

    // VERIFY OTP
    public ApiResponse verifyOtp(OtpRequest req) {

        log.info("OTP verification requested for mobile={}", req.getMobile());

        boolean valid =
                otpService.verifyOtp(req.getMobile(), req.getOtp());

        if (!valid)
            throw new RuntimeException("Invalid OTP");

        AuthUsers user =
                repo.findByMobile(req.getMobile())
                        .orElseThrow();

        user.setEnabled(true);
        repo.save(user);
        return new ApiResponse(true, "User is successfully verified");
    }

    // LOGIN
    public String login(LoginRequest req) {

        log.info("Login requested for username={}", req.getUsername());

        AuthUsers user =
                repo.findByUsername(req.getUsername())
                        .orElseThrow();

        if (!user.isEnabled())
            throw new RuntimeException("OTP not verified");

        if (!encoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid credentials");

        return jwtService.generateToken(user);
    }
}

