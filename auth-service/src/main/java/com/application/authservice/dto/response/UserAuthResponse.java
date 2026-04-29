package com.application.authservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserAuthResponse {

    private String userId;
    private String username;
    private String role;
    private boolean enabled;
}
