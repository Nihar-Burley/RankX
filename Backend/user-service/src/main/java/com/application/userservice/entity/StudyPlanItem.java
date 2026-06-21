package com.application.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "study_plan_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_plan_id", nullable = false)
    private StudyPlan studyPlan;

    @Column(nullable = false)
    private Integer sequenceNumber;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudyPlanItemType itemType;

    @Column
    private String referenceType;

    @Column
    private String referenceId;

    @Column(nullable = false)
    private String referenceKey;

    @Column(nullable = false)
    private Integer estimatedMinutes;
}
