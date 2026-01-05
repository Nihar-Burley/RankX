package com.application.submissionservice.utility;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class LanguageRegistry {

    private static final Map<String, Integer> LANGUAGE_MAP = Map.of(
            "java17", 62,
            "python3", 71,
            "cpp17", 54,
            "javascript", 63
    );

    public int getLanguageId(String languageKey) {
        Integer id = LANGUAGE_MAP.get(languageKey);
        if (id == null) {
            throw new IllegalArgumentException("Unsupported language: " + languageKey);
        }
        return id;
    }
}

