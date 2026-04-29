package com.application.userservice.service;

import com.application.userservice.dto.UserProfileResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserProfileService {

    public UserProfileResponse getProfile(UUID userId, String role) {
        return UserProfileResponse.builder()
                .userId(userId.toString())
                .role(role)
                .displayName("User " + userId.toString().substring(0, 8))
                .build();
    }
}
