package com.application.problemservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SampleTestCaseResponse {
    private Long id;
    private String input;
    private String expectedOutput; // OK for samples
}
