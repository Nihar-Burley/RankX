package com.application.resultservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ResultResponse {

    private UUID attemptId;
    private UUID quizId;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private LocalDateTime evaluatedAt;
}
