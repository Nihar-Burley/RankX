package com.application.problemservice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemTemplateResponse {

    private String languageKey;
    private String starterCode;
}
