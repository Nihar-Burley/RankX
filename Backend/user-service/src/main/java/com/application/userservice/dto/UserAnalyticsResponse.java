package com.application.userservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserAnalyticsResponse {

    private CodingAnalyticsResponse codingPerformance;
    private QuizAnalyticsResponse quizPerformance;
    private ActivityAnalyticsResponse activitySummary;
    private RecommendationCardResponse primaryRecommendation;
    private List<RecommendationCardResponse> recommendations;
}
