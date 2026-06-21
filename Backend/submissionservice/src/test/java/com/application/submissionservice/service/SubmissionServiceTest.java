package com.application.submissionservice.service;

import com.application.submissionservice.client.ProblemServiceClient;
import com.application.submissionservice.client.UserProgressClient;
import com.application.submissionservice.dto.ActivityProgressUpdateRequest;
import com.application.submissionservice.dto.JudgeTestCaseDTO;
import com.application.submissionservice.dto.ProblemAttemptSummaryResponse;
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
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();

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
        submitRequest.setLanguageKey("java");
        submitRequest.setSourceCode("class Main {}");
    }

    @Test
    void acceptedCodingSubmissionShouldUpdateProgress() {
        Submission savedSubmission = Submission.builder()
                .id(44L)
                .userId(USER_ID)
                .problemId(101L)
                .languageKey("java")
                .sourceCode("class Main {}")
                .status(SubmissionStatus.PENDING)
                .build();

        when(languageRegistry.getLanguageId("java")).thenReturn(62);
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(savedSubmission)
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(problemServiceClient.getAllTestCases(101L)).thenReturn(List.of(
                new JudgeTestCaseDTO("1 2", "3")
        ));
        Map<String, Object> acceptedResponse = new HashMap<>();
        acceptedResponse.put("stdout", "3\n");
        acceptedResponse.put("stderr", null);
        acceptedResponse.put("compile_output", null);
        acceptedResponse.put("time", "0.01");
        acceptedResponse.put("memory", 1024);
        acceptedResponse.put("status", Map.of("id", 3));
        when(judge0Client.submit(anyString(), anyString(), eq(62))).thenReturn(acceptedResponse);

        SubmitResponse response = submissionService.submit(submitRequest, USER_ID);

        assertThat(response.verdict()).isEqualTo("ACCEPTED");
        verify(userProgressClient).updateActivityProgress(eq(USER_ID.toString()), eq("ROLE_USER"), progressRequestCaptor.capture());
        assertThat(progressRequestCaptor.getValue().referenceKey()).isEqualTo("problem-101");
        assertThat(progressRequestCaptor.getValue().itemType()).isEqualTo("CODING_PROBLEM");
    }

    @Test
    void failedCodingSubmissionShouldNotCompleteProgress() {
        Submission savedSubmission = Submission.builder()
                .id(55L)
                .userId(USER_ID)
                .problemId(101L)
                .languageKey("java")
                .sourceCode("class Main {}")
                .status(SubmissionStatus.PENDING)
                .build();

        when(languageRegistry.getLanguageId("java")).thenReturn(62);
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(savedSubmission)
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(problemServiceClient.getAllTestCases(101L)).thenReturn(List.of(
                new JudgeTestCaseDTO("1 2", "3")
        ));
        Map<String, Object> failedResponse = new HashMap<>();
        failedResponse.put("stdout", "4\n");
        failedResponse.put("stderr", null);
        failedResponse.put("compile_output", null);
        failedResponse.put("time", "0.01");
        failedResponse.put("memory", 1024);
        failedResponse.put("status", Map.of("id", 3));
        when(judge0Client.submit(anyString(), anyString(), eq(62))).thenReturn(failedResponse);

        SubmitResponse response = submissionService.submit(submitRequest, USER_ID);

        assertThat(response.verdict()).isEqualTo("WRONG_ANSWER");
        verify(userProgressClient, never()).updateActivityProgress(anyString(), anyString(), any(ActivityProgressUpdateRequest.class));
    }

    @Test
    void shouldFilterSubmissionHistory() {
        when(submissionRepository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(List.of(
                Submission.builder().id(1L).userId(USER_ID).problemId(101L).languageKey("java").status(SubmissionStatus.ACCEPTED).build(),
                Submission.builder().id(2L).userId(USER_ID).problemId(102L).languageKey("python").status(SubmissionStatus.WRONG_ANSWER).build(),
                Submission.builder().id(3L).userId(USER_ID).problemId(101L).languageKey("java").status(SubmissionStatus.WRONG_ANSWER).build()
        ));

        var response = submissionService.getSubmissionHistory(USER_ID, "WRONG_ANSWER", "java", 101L);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().id()).isEqualTo(3L);
    }

    @Test
    void shouldBuildProblemAttemptSummary() {
        when(submissionRepository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(List.of(
                Submission.builder().id(4L).userId(USER_ID).problemId(101L).languageKey("java").status(SubmissionStatus.ACCEPTED).runtimeMs(120).build(),
                Submission.builder().id(5L).userId(USER_ID).problemId(101L).languageKey("python").status(SubmissionStatus.WRONG_ANSWER).runtimeMs(180).build(),
                Submission.builder().id(6L).userId(USER_ID).problemId(102L).languageKey("java").status(SubmissionStatus.ACCEPTED).runtimeMs(110).build()
        ));

        ProblemAttemptSummaryResponse summary = submissionService.getProblemAttemptSummary(USER_ID, 101L);

        assertThat(summary.totalAttempts()).isEqualTo(2);
        assertThat(summary.acceptedAttempts()).isEqualTo(1);
        assertThat(summary.latestStatus()).isEqualTo("ACCEPTED");
        assertThat(summary.bestRuntimeMs()).isEqualTo(120);
        assertThat(summary.languagesUsed()).containsExactly("java", "python");
    }
}
