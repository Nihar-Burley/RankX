package com.application.authservice.entity;

import jakarta.persistence.*;
import jdk.jfr.DataAmount;
import lombok.*;

@Entity
@Table(name = "auth_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUsers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String mobile;
    private String role;
    private boolean enabled;
}
