package com.application.problemservice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemLanguageResponse {

    private String languageKey;   // java17, python3
    private String displayName;   // Java 17, Python 3
    private String editorMode;    // java, python
}
