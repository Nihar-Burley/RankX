package com.application.submissionservice.dto;

import lombok.*;

import java.util.List;

@Builder
public record SubmitResponse(
        Long submissionId,
        String verdict,
        List<TestCaseResultDTO> results,
        Long runtimeMs,
        Integer memoryKb
) {}
