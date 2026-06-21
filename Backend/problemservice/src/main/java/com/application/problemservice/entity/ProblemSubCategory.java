package com.application.problemservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "problem_subcategories",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"category_id", "key"})
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ProblemSubCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ProblemCategory category;

    @Column(nullable = false)
    private String key;   // arrays, dp, graphs

    @Column(nullable = false)
    private String name;  // Arrays, Dynamic Programming

    private Boolean active = true;
}
