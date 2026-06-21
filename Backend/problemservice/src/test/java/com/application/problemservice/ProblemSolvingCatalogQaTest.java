package com.application.problemservice;

import com.application.problemservice.dto.ProblemResponse;
import com.application.problemservice.entity.Problem;
import com.application.problemservice.entity.TestCase;
import com.application.problemservice.repository.ProblemRepository;
import com.application.problemservice.repository.TestCaseRepository;
import com.application.problemservice.service.ProblemService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.stream.LongStream;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:problemcatalogqa;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.defer-datasource-initialization=true",
        "spring.sql.init.mode=always"
})
class ProblemSolvingCatalogQaTest {

    private static final List<Long> PROBLEM_IDS = LongStream.rangeClosed(101, 130)
            .boxed()
            .toList();
    private static final List<String> SUPPORTED_LANGUAGE_KEYS = List.of("java17", "python3", "javascript");

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private ProblemService problemService;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Test
    void shouldSeedExactlyThirtyRichProblems() {
        assertThat(problemRepository.count()).isEqualTo(30);
    }

    @ParameterizedTest(name = "problem {0} should keep core metadata populated")
    @MethodSource("problemIds")
    void problemShouldHaveCoreMetadata(Long problemId) {
        Problem problem = problemRepository.findById(problemId).orElseThrow();

        assertThat(problem.getTitle()).isNotBlank();
        assertThat(problem.getStatement()).isNotBlank();
        assertThat(problem.getConstraints()).isNotBlank();
        assertThat(problem.getEditorial()).isNotBlank();
        assertThat(problem.getTags()).isNotBlank();
        assertThat(problem.getActive()).isTrue();
    }

    @ParameterizedTest(name = "problem {0} should expose all supported languages")
    @MethodSource("problemIds")
    void problemShouldExposeSupportedLanguages(Long problemId) {
        ProblemResponse problem = problemService.getProblemById(problemId);

        assertThat(problem.getLanguages()).hasSize(3);
        assertThat(problem.getLanguages())
                .extracting("languageKey")
                .containsExactlyInAnyOrderElementsOf(SUPPORTED_LANGUAGE_KEYS);
        assertThat(problem.getLanguages())
                .extracting("displayName")
                .allMatch(value -> value != null && !value.toString().isBlank());
        assertThat(problem.getLanguages())
                .extracting("editorMode")
                .allMatch(value -> value != null && !value.toString().isBlank());
    }

    @ParameterizedTest(name = "problem {0} should include starter code for {1}")
    @MethodSource("problemLanguagePairs")
    void problemLanguageShouldHaveMatchingStarterTemplate(Long problemId, String languageKey) {
        ProblemResponse problem = problemService.getProblemById(problemId);

        assertThat(problem.getTemplates())
                .filteredOn(template -> languageKey.equals(template.getLanguageKey()))
                .singleElement()
                .satisfies(template -> assertThat(template.getStarterCode()).isNotBlank());
    }

    @ParameterizedTest(name = "problem {0} should keep exactly two public sample tests")
    @MethodSource("problemIds")
    void problemShouldProvidePublicSampleCoverage(Long problemId) {
        List<TestCase> sampleCases = testCaseRepository.findByProblemIdAndIsSampleTrueAndActiveTrue(problemId);

        assertThat(sampleCases).hasSize(2);
        assertThat(sampleCases)
                .extracting(TestCase::getInput)
                .allMatch(input -> input != null && !input.isBlank());
        assertThat(sampleCases)
                .extracting(TestCase::getExpectedOutput)
                .allMatch(output -> output != null && !output.isBlank());
    }

    @ParameterizedTest(name = "problem {0} should keep hidden judge coverage")
    @MethodSource("problemIds")
    void problemShouldProvideHiddenJudgeCoverage(Long problemId) {
        List<TestCase> activeCases = testCaseRepository.findByProblemIdAndActiveTrue(problemId);
        List<TestCase> sampleCases = testCaseRepository.findByProblemIdAndIsSampleTrueAndActiveTrue(problemId);

        assertThat(activeCases).hasSize(3);
        assertThat(activeCases.stream().filter(testCase -> !Boolean.TRUE.equals(testCase.getIsSample())).count()).isEqualTo(1);
        assertThat(activeCases).allMatch(testCase -> Boolean.TRUE.equals(testCase.getActive()));
        assertThat(activeCases.size()).isGreaterThan(sampleCases.size());
    }

    private static Stream<Long> problemIds() {
        return PROBLEM_IDS.stream();
    }

    private static Stream<Arguments> problemLanguagePairs() {
        return PROBLEM_IDS.stream()
                .flatMap(problemId -> SUPPORTED_LANGUAGE_KEYS.stream()
                        .map(languageKey -> arguments(problemId, languageKey)));
    }
}
