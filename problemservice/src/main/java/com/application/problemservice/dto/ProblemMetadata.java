package com.application.problemservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemMetadata {
    private Long id;
    private String title;
    private String difficulty;
    private String[] tags;
}