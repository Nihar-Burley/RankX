package com.application.problemservice.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseRequest {

    @NotBlank
    private String input;

    @NotBlank
    private String expectedOutput;

    @NotNull
    private Boolean isSample;

    private Integer score = 1;

    private Integer timeLimitMs;
    private Integer memoryLimitKb;
}
