package com.application.userservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActivityAnalyticsResponse {

    private long totalCodingActivities;
    private long totalQuizActivities;
    private long enrolledStudyPlans;
    private long totalCompletedPlanItems;
    private Integer streakCount;
    private LocalDateTime latestCodingActivityAt;
    private LocalDateTime latestQuizActivityAt;
    private LocalDateTime latestOverallActivityAt;
}
