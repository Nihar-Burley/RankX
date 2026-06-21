package com.application.userservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminStudyPlanItemRequest {

    @NotNull(message = "Sequence number is required")
    @Min(value = 1, message = "Sequence number must be at least 1")
    private Integer sequenceNumber;

    @NotBlank(message = "Item title is required")
    private String title;

    @NotBlank(message = "Item description is required")
    private String description;

    @NotBlank(message = "Item type is required")
    private String itemType;

    @NotBlank(message = "Reference type is required")
    private String referenceType;

    @NotBlank(message = "Reference ID is required")
    private String referenceId;

    @NotNull(message = "Estimated minutes is required")
    @Min(value = 1, message = "Estimated minutes must be at least 1")
    private Integer estimatedMinutes;
}
