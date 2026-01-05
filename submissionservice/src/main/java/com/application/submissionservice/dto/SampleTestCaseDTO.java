package com.application.submissionservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SampleTestCaseDTO(
        String input,
        String expectedOutput
) {}

