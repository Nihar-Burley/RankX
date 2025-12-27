package com.application.problemservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "problem_languages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private String languageKey; // python3, java17, js

    @Column(nullable = false)
    private String displayName; // Python 3, Java 17

    @Column(nullable = false)
    private String editorMode; // python, java, javascript

    private Boolean active = true;
}
