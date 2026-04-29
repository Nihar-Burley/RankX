package com.application.authservice.controller;

import com.application.authservice.dto.request.LoginRequest;
import com.application.authservice.dto.request.OtpRequest;
import com.application.authservice.dto.request.RegisterRequest;
import com.application.authservice.dto.response.ApiResponse;
import com.application.authservice.dto.response.TokenResponse;
import com.application.authservice.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ApiResponse register(@RequestBody RegisterRequest req) {
        return service.register(req);
    }

    @PostMapping("/verify-otp")
    public ApiResponse verifyOtp(@RequestBody OtpRequest req) {
        return service.verifyOtp(req);
    }

    @PostMapping("/login")
    public TokenResponse login(@RequestBody LoginRequest req) {
        return new TokenResponse(service.login(req));
    }
}

