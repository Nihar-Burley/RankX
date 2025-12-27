    package com.application.problemservice.entity;

    import com.fasterxml.jackson.annotation.JsonIgnore;
    import jakarta.persistence.*;
    import lombok.*;
    import org.hibernate.annotations.CreationTimestamp;
    import org.hibernate.annotations.UpdateTimestamp;

    import java.time.LocalDateTime;
    import java.util.List;
    @Entity
    @Table(name = "problems")
    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Problem {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true)
        private String title;

        @Column(columnDefinition = "TEXT", nullable = false)
        private String statement;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Difficulty difficulty;

        @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonIgnore
        private List<TestCase> testCases;

        @Column(columnDefinition = "TEXT")
        private String tags;

        @Column(columnDefinition = "TEXT")
        private String constraints;

        @Column(columnDefinition = "TEXT")
        private String editorial;

        @Column(name = "created_by")
        private Long createdBy;

        private Boolean active = true;

        /* 🚀 ADD THESE */
        private Integer timeLimitMs;     // 1000, 2000
        private Integer memoryLimitMb;   // 256, 512

        @CreationTimestamp
        private LocalDateTime createdAt;

        @UpdateTimestamp
        private LocalDateTime updatedAt;
    }
