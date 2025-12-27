package com.application.userservice.dto;

import lombok.Data;

@Data
public class ValidateCredentialsResponse {
    private Long id;
    private String email;
    private String role;
    private Boolean valid;
}
