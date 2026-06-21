package com.application.submissionservice.utility;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LanguageRegistryTest {

    private final LanguageRegistry languageRegistry = new LanguageRegistry();

    @ParameterizedTest(name = "language {0} should resolve to judge0 id {1}")
    @CsvSource({
            "java17,62",
            "python3,71",
            "cpp17,54",
            "javascript,63"
    })
    void shouldResolveSupportedLanguages(String languageKey, int expectedId) {
        assertThat(languageRegistry.getLanguageId(languageKey)).isEqualTo(expectedId);
    }

    @ParameterizedTest(name = "unsupported language {0} should be rejected")
    @ValueSource(strings = {"java", "python", "typescript", "go", "rust", "csharp"})
    void shouldRejectUnsupportedLanguages(String languageKey) {
        assertThatThrownBy(() -> languageRegistry.getLanguageId(languageKey))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported language");
    }
}
