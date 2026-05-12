package com.application.userservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminStudyPlanResponse {

    private Long id;
    private String slug;
    private String title;
    private String description;
    private String track;
    private String level;
    private boolean active;
    private Integer totalItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ItemResponse> items;

    @Data
    @Builder
    public static class ItemResponse {
        private Long id;
        private Integer sequenceNumber;
        private String title;
        private String description;
        private String itemType;
        private String referenceType;
        private String referenceId;
        private String referenceKey;
        private Integer estimatedMinutes;
    }
}
