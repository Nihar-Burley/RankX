package com.application.submissionservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ProblemLanguageDTO(
        String languageKey,
        String displayName,
        String editorMode
) {}
