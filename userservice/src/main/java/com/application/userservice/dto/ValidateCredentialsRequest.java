package com.application.userservice.dto;

import lombok.Data;

@Data
public class ValidateCredentialsRequest {
    private String email;
    private String password;
}