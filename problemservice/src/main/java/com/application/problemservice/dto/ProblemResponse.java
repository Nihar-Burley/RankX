package com.application.problemservice.dto;

import com.application.problemservice.dto.ProblemLanguageResponse;
import com.application.problemservice.dto.ProblemTemplateResponse;
import com.application.problemservice.entity.Difficulty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProblemResponse {

    private Long id;
    private String title;
    private String statement;
    private Difficulty difficulty;
    private List<String> tags;
    private String constraints;

    // ✅ ADD THESE
    private List<ProblemLanguageResponse> languages;
    private List<ProblemTemplateResponse> templates;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
