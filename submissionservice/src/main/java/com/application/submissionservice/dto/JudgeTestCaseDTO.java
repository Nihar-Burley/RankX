package com.application.submissionservice.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JudgeTestCaseDTO(
        String input,
        String expectedOutput
) {}
