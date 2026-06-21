package com.application.submissionservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ProblemDetailDTO(
        Long id,
        String title,
        List<ProblemLanguageDTO> languages
) {}
