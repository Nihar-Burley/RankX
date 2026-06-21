package com.application.submissionservice.service;

import com.application.submissionservice.client.ProblemServiceClient;
import com.application.submissionservice.client.UserProgressClient;
import com.application.submissionservice.dto.ActivityProgressUpdateRequest;
import com.application.submissionservice.dto.JudgeTestCaseDTO;
import com.application.submissionservice.dto.ProblemDetailDTO;
import com.application.submissionservice.dto.ProblemLanguageDTO;
import com.application.submissionservice.dto.RunRequest;
import com.application.submissionservice.dto.RunResponse;
import com.application.submissionservice.dto.SampleTestCaseDTO;
import com.application.submissionservice.dto.SubmitRequest;
import com.application.submissionservice.dto.SubmitResponse;
import com.application.submissionservice.entity.Submission;
import com.application.submissionservice.entity.SubmissionStatus;
import com.application.submissionservice.judge.Judge0Client;
import com.application.submissionservice.repository.SubmissionRepository;
import com.application.submissionservice.utility.LanguageRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionProblemSolvingQaTest {

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000102");

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private ProblemServiceClient problemServiceClient;

    @Mock
    private Judge0Client judge0Client;

    @Mock
    private LanguageRegistry languageRegistry;

    @Mock
    private UserProgressClient userProgressClient;

    @InjectMocks
    private SubmissionService submissionService;

    @Captor
    private ArgumentCaptor<ActivityProgressUpdateRequest> progressRequestCaptor;

    private SubmitRequest submitRequest;

    @BeforeEach
    void setUp() {
        submitRequest = new SubmitRequest();
        submitRequest.setProblemId(101L);
        submitRequest.setLanguageKey("java17");
        submitRequest.setSourceCode("class Main { public static void main(String[] args) {} }");
    }

    @ParameterizedTest(name = "run custom input should respect selected language {0}")
    @MethodSource("supportedLanguages")
    void runShouldRespectSelectedLanguageForCustomInput(String languageKey, int languageId, String sourceCode) {
        RunRequest request = runRequest(languageKey, sourceCode);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(judge0Client.submit(sourceCode, "5 7", languageId))
                .thenReturn(judgeResult("12\n", null, null, 3));

        RunResponse response = submissionService.run(request, "5 7");

        verify(problemServiceClient, never()).getSampleTestCases(anyLong());
        verify(judge0Client).submit(sourceCode, "5 7", languageId);
        assertThat(response.getResults()).hasSize(1);
        assertThat(response.getResults().getFirst().getActualOutput()).isEqualTo("12");
        assertThat(response.getResults().getFirst().isPassed()).isTrue();
    }

    @ParameterizedTest(name = "sample run should pass for {0}")
    @MethodSource("supportedLanguages")
    void runShouldPassSampleCasesWhenOutputMatches(String languageKey, int languageId, String sourceCode) {
        RunRequest request = runRequest(languageKey, sourceCode);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(problemServiceClient.getSampleTestCases(101L)).thenReturn(List.of(
                new SampleTestCaseDTO("1 2", "3"),
                new SampleTestCaseDTO("4 5", "9")
        ));
        when(judge0Client.submit(sourceCode, "1 2", languageId)).thenReturn(judgeResult("3\n", null, null, 3));
        when(judge0Client.submit(sourceCode, "4 5", languageId)).thenReturn(judgeResult("9\n", null, null, 3));

        RunResponse response = submissionService.run(request, "");

        assertThat(response.getResults()).hasSize(2);
        assertThat(response.getResults()).allMatch(result -> result.getActualOutput() != null && !result.getActualOutput().isBlank());
        assertThat(response.getResults()).allMatch(result -> result.isPassed());
    }

    @ParameterizedTest(name = "sample run should fail mismatched output for {0}")
    @MethodSource("supportedLanguages")
    void runShouldFailSampleCasesWhenOutputDiffers(String languageKey, int languageId, String sourceCode) {
        RunRequest request = runRequest(languageKey, sourceCode);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(problemServiceClient.getSampleTestCases(101L)).thenReturn(List.of(
                new SampleTestCaseDTO("1 2", "3"),
                new SampleTestCaseDTO("4 5", "9")
        ));
        when(judge0Client.submit(sourceCode, "1 2", languageId)).thenReturn(judgeResult("4\n", null, null, 3));
        when(judge0Client.submit(sourceCode, "4 5", languageId)).thenReturn(judgeResult("10\n", null, null, 3));

        RunResponse response = submissionService.run(request, null);

        assertThat(response.getResults()).hasSize(2);
        assertThat(response.getResults())
                .extracting(result -> result.isPassed())
                .containsOnly(false);
    }

    @ParameterizedTest(name = "run should surface compiler output for {0}")
    @MethodSource("supportedLanguages")
    void runShouldSurfaceCompileOutput(String languageKey, int languageId, String sourceCode) {
        RunRequest request = runRequest(languageKey, sourceCode);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(problemServiceClient.getSampleTestCases(101L)).thenReturn(List.of(new SampleTestCaseDTO("1 2", "3")));
        when(judge0Client.submit(sourceCode, "1 2", languageId))
                .thenReturn(judgeResult(null, null, "Compilation failed", 6));

        RunResponse response = submissionService.run(request, null);

        assertThat(response.getResults()).singleElement().satisfies(result -> {
            assertThat(result.getActualOutput()).isEqualTo("Compilation failed");
            assertThat(result.isPassed()).isFalse();
        });
    }

    @ParameterizedTest(name = "run should surface runtime stderr for {0}")
    @MethodSource("supportedLanguages")
    void runShouldSurfaceRuntimeErrors(String languageKey, int languageId, String sourceCode) {
        RunRequest request = runRequest(languageKey, sourceCode);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(problemServiceClient.getSampleTestCases(101L)).thenReturn(List.of(new SampleTestCaseDTO("1 2", "3")));
        when(judge0Client.submit(sourceCode, "1 2", languageId))
                .thenReturn(judgeResult(null, "ZeroDivisionError", null, 11));

        RunResponse response = submissionService.run(request, null);

        assertThat(response.getResults()).singleElement().satisfies(result -> {
            assertThat(result.getActualOutput()).isEqualTo("ZeroDivisionError");
            assertThat(result.isPassed()).isFalse();
        });
    }

    @ParameterizedTest(name = "submit should accept exact judge outputs for {0}")
    @MethodSource("supportedLanguages")
    void submitShouldAcceptExactJudgeOutputs(String languageKey, int languageId, String sourceCode) {
        Submission pending = pendingSubmission(languageKey, sourceCode, 700L + languageId);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(pending)
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(problemServiceClient.getAllTestCases(101L)).thenReturn(List.of(
                new JudgeTestCaseDTO("1 2", "3"),
                new JudgeTestCaseDTO("4 5", "9"),
                new JudgeTestCaseDTO("10 2", "12")
        ));
        when(judge0Client.submit(sourceCode, "1 2", languageId)).thenReturn(judgeResult("3\n", null, null, 3));
        when(judge0Client.submit(sourceCode, "4 5", languageId)).thenReturn(judgeResult("9\n", null, null, 3));
        when(judge0Client.submit(sourceCode, "10 2", languageId)).thenReturn(judgeResult("12\n", null, null, 3));

        SubmitResponse response = submissionService.submit(submitRequest(languageKey, sourceCode), USER_ID);

        assertThat(response.verdict()).isEqualTo("ACCEPTED");
        assertThat(response.results()).hasSize(3);
        assertThat(response.results()).allMatch(result -> result.passed());
        verify(userProgressClient).updateActivityProgress(eq(USER_ID.toString()), eq("ROLE_USER"), progressRequestCaptor.capture());
        assertThat(progressRequestCaptor.getValue().referenceKey()).isEqualTo("problem-101");
    }

    @ParameterizedTest(name = "submit should mark wrong answer for mismatched hidden output in {0}")
    @MethodSource("supportedLanguages")
    void submitShouldReturnWrongAnswerWhenOutputDiffers(String languageKey, int languageId, String sourceCode) {
        Submission pending = pendingSubmission(languageKey, sourceCode, 800L + languageId);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(pending)
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(problemServiceClient.getAllTestCases(101L)).thenReturn(List.of(
                new JudgeTestCaseDTO("1 2", "3"),
                new JudgeTestCaseDTO("4 5", "9"),
                new JudgeTestCaseDTO("10 2", "12")
        ));
        when(judge0Client.submit(sourceCode, "1 2", languageId)).thenReturn(judgeResult("4\n", null, null, 3));
        when(judge0Client.submit(sourceCode, "4 5", languageId)).thenReturn(judgeResult("10\n", null, null, 3));
        when(judge0Client.submit(sourceCode, "10 2", languageId)).thenReturn(judgeResult("13\n", null, null, 3));

        SubmitResponse response = submissionService.submit(submitRequest(languageKey, sourceCode), USER_ID);

        assertThat(response.verdict()).isEqualTo("WRONG_ANSWER");
        assertThat(response.results()).hasSize(3);
        assertThat(response.results()).allMatch(result -> !result.passed());
        verify(userProgressClient, never()).updateActivityProgress(anyString(), eq("ROLE_USER"), any(ActivityProgressUpdateRequest.class));
    }

    @ParameterizedTest(name = "submit should return compilation error for {0}")
    @MethodSource("supportedLanguages")
    void submitShouldReturnCompilationError(String languageKey, int languageId, String sourceCode) {
        Submission pending = pendingSubmission(languageKey, sourceCode, 900L + languageId);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(pending)
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(problemServiceClient.getAllTestCases(101L)).thenReturn(List.of(new JudgeTestCaseDTO("1 2", "3")));
        when(judge0Client.submit(sourceCode, "1 2", languageId))
                .thenReturn(judgeResult(null, null, "Compilation failed", 6));

        SubmitResponse response = submissionService.submit(submitRequest(languageKey, sourceCode), USER_ID);

        assertThat(response.verdict()).isEqualTo("COMPILATION_ERROR");
        assertThat(response.results()).singleElement().satisfies(result -> assertThat(result.passed()).isFalse());
    }

    @ParameterizedTest(name = "submit should return runtime error for {0}")
    @MethodSource("supportedLanguages")
    void submitShouldReturnRuntimeError(String languageKey, int languageId, String sourceCode) {
        Submission pending = pendingSubmission(languageKey, sourceCode, 1000L + languageId);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(pending)
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(problemServiceClient.getAllTestCases(101L)).thenReturn(List.of(new JudgeTestCaseDTO("1 2", "3")));
        when(judge0Client.submit(sourceCode, "1 2", languageId))
                .thenReturn(judgeResult(null, "NullPointerException", null, 11));

        SubmitResponse response = submissionService.submit(submitRequest(languageKey, sourceCode), USER_ID);

        assertThat(response.verdict()).isEqualTo("RUNTIME_ERROR");
        assertThat(response.results()).singleElement().satisfies(result -> assertThat(result.passed()).isFalse());
    }

    @ParameterizedTest(name = "submit should return time limit exceeded for {0}")
    @MethodSource("supportedLanguages")
    void submitShouldReturnTimeLimitExceeded(String languageKey, int languageId, String sourceCode) {
        Submission pending = pendingSubmission(languageKey, sourceCode, 1100L + languageId);
        when(languageRegistry.getLanguageId(languageKey)).thenReturn(languageId);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails(languageKey));
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(pending)
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(problemServiceClient.getAllTestCases(101L)).thenReturn(List.of(new JudgeTestCaseDTO("1 2", "3")));
        when(judge0Client.submit(sourceCode, "1 2", languageId))
                .thenReturn(judgeResult(null, "Time limit exceeded", null, 5));

        SubmitResponse response = submissionService.submit(submitRequest(languageKey, sourceCode), USER_ID);

        assertThat(response.verdict()).isEqualTo("TIME_LIMIT_EXCEEDED");
        assertThat(response.results()).singleElement().satisfies(result -> assertThat(result.passed()).isFalse());
    }

    @Test
    void shouldRejectUnsupportedLanguage() {
        when(languageRegistry.getLanguageId("ruby3")).thenThrow(new IllegalArgumentException("Unsupported language: ruby3"));

        assertThatThrownBy(() -> submissionService.submit(submitRequest("ruby3", "puts 1"), USER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported language");
    }

    @Test
    void shouldRejectLanguageThatProblemDoesNotSupport() {
        when(languageRegistry.getLanguageId("java17")).thenReturn(62);
        when(problemServiceClient.getProblemDetails(101L)).thenReturn(problemDetails("python3", "javascript"));

        assertThatThrownBy(() -> submissionService.submit(submitRequest("java17", "class Main {}"), USER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Language 'java17' is not enabled for problem 101");
    }

    @Test
    void shouldRejectBlankSourceCodeForRunAndSubmit() {
        RunRequest runRequest = runRequest("java17", "   ");

        assertThatThrownBy(() -> submissionService.run(runRequest, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Source code is missing");

        assertThatThrownBy(() -> submissionService.submit(submitRequest("java17", "   "), USER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Source code is missing");
    }

    private static Stream<Arguments> supportedLanguages() {
        return Stream.of(
                arguments("java17", 62, "class Main { public static void main(String[] args) { System.out.print(12); } }"),
                arguments("python3", 71, "print(12)"),
                arguments("javascript", 63, "console.log(12);")
        );
    }

    private RunRequest runRequest(String languageKey, String sourceCode) {
        RunRequest request = new RunRequest();
        request.setProblemId(101L);
        request.setLanguageKey(languageKey);
        request.setSourceCode(sourceCode);
        return request;
    }

    private SubmitRequest submitRequest(String languageKey, String sourceCode) {
        SubmitRequest request = new SubmitRequest();
        request.setProblemId(101L);
        request.setLanguageKey(languageKey);
        request.setSourceCode(sourceCode);
        return request;
    }

    private Submission pendingSubmission(String languageKey, String sourceCode, long submissionId) {
        return Submission.builder()
                .id(submissionId)
                .userId(USER_ID)
                .problemId(101L)
                .languageKey(languageKey)
                .sourceCode(sourceCode)
                .status(SubmissionStatus.PENDING)
                .build();
    }

    private Map<String, Object> judgeResult(
            String stdout,
            String stderr,
            String compileOutput,
            int statusId
    ) {
        Map<String, Object> response = new HashMap<>();
        response.put("stdout", stdout);
        response.put("stderr", stderr);
        response.put("compile_output", compileOutput);
        response.put("time", "0.01");
        response.put("memory", 1024);
        response.put("status", Map.of("id", statusId));
        return response;
    }

    private ProblemDetailDTO problemDetails(String... languageKeys) {
        List<ProblemLanguageDTO> languages = Stream.of(languageKeys)
                .map(languageKey -> new ProblemLanguageDTO(languageKey, languageKey, languageKey))
                .toList();
        return new ProblemDetailDTO(101L, "Two Sum", languages);
    }
}
