package com.application.authservice.service;

import com.application.authservice.dto.request.LoginRequest;
import com.application.authservice.dto.request.OtpRequest;
import com.application.authservice.dto.request.RegisterRequest;
import com.application.authservice.entity.AuthUsers;
import com.application.authservice.repository.AuthUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthService {

    @Autowired
    private AuthUserRepository repo;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OtpService otpService;

    // REGISTER
    public String register(RegisterRequest req) {

        log.info("register method ---> "+req);

        AuthUsers user = AuthUsers.builder()
                .username(req.getUsername())
                .password(encoder.encode(req.getPassword()))
                .mobile(req.getMobile())
                .role("ROLE_USER")
                .enabled(false)
                .build();

        repo.save(user);
        String otp=otpService.generateAndSaveOtp(req.getMobile());
        return otp;
    }

    // VERIFY OTP
    public String verifyOtp(OtpRequest req) {

        log.info("verifyOtp method ---> "+req);

        boolean valid =
                otpService.verifyOtp(req.getMobile(), req.getOtp());

        if (!valid)
            throw new RuntimeException("Invalid OTP");

        AuthUsers user =
                repo.findByMobile(req.getMobile())
                        .orElseThrow();

        user.setEnabled(true);
        repo.save(user);
        return "User is successfully verified";
    }

    // LOGIN
    public String login(LoginRequest req) {

        log.info("Login method ---> "+req);

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

