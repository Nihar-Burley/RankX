package com.application.userservice.dto;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String name;
    private String email;
    private String password;
    private String role; // Assuming role is passed as a string
}