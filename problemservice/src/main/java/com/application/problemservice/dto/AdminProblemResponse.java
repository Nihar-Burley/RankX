package com.application.problemservice.dto;

import com.application.problemservice.entity.Difficulty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProblemResponse {

    private Long id;
    private String title;
    private String statement;
    private Difficulty difficulty;
    private List<String> tags;
    private String constraints;
    private String editorial;
    private Long createdBy;
    private Boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

