package com.application.userservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecommendationCardResponse {

    private String title;
    private String description;
    private String route;
    private String reason;
    private String priority;
    private String recommendationType;
}
