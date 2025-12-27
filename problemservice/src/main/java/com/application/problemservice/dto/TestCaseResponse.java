package com.application.problemservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseResponse {

    private Long id;
    private String input;
    private String expectedOutput;
    private Boolean isSample;
    private Integer score;
    private Boolean active;
}
