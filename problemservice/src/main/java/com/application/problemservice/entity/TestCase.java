package com.application.problemservice.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "test_cases",
        indexes = {
                @Index(name = "idx_testcase_problem", columnList = "problem_id"),
                @Index(name = "idx_testcase_sample", columnList = "is_sample")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* -------------------- Relationship -------------------- */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    /* -------------------- Core Judge Data -------------------- */

    @Column(columnDefinition = "TEXT", nullable = false)
    private String input;

    @Column(name = "expected_output", columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;

    /* -------------------- Visibility -------------------- */

    @Column(name = "is_sample", nullable = false)
    private Boolean isSample = false;
    // true  -> visible to user
    // false -> hidden (judge only)

    /* -------------------- Scoring & Limits -------------------- */

    @Column(nullable = false)
    private Integer score = 1; // supports partial scoring

    @Column(name = "memory_limit_mb")
    private Integer memoryLimitMb;



    /* -------------------- Status -------------------- */

    private Boolean active = true; // soft delete

    /* -------------------- Audit -------------------- */

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
