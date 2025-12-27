package com.application.problemservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JudgeTestCaseResponse {
    private Long id;
    private String input;
    private String expectedOutput;
    private Integer score;
    private Integer timeLimitMs;
    private Integer memoryLimitKb;
}

