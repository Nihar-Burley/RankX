package com.application.problemservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "problem_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String key;   // algorithms, databases, shell

    @Column(nullable = false)
    private String name;  // Algorithms, Databases

    private Boolean active = true;
}

