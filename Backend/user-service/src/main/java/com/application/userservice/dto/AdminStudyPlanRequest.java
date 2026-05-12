package com.application.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AdminStudyPlanRequest {

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Track is required")
    private String track;

    @NotBlank(message = "Level is required")
    private String level;

    private Boolean active;

    private List<AdminStudyPlanItemRequest> items = new ArrayList<>();
}
