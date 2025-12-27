package com.application.problemservice.entity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "problem_templates")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ProblemTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private String languageKey; // must match ProblemLanguage.languageKey

    @Column(columnDefinition = "TEXT", nullable = false)
    private String starterCode;
}

