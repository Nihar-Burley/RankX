package com.application.submissionservice.controller;

import com.application.submissionservice.dto.ProblemAttemptSummaryResponse;
import com.application.submissionservice.dto.RunResponse;
import com.application.submissionservice.dto.SubmissionDetailResponse;
import com.application.submissionservice.dto.SubmissionSummaryResponse;
import com.application.submissionservice.dto.SubmitRequest;
import com.application.submissionservice.dto.SubmitResponse;
import com.application.submissionservice.entity.SubmissionStatus;
import com.application.submissionservice.service.SubmissionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SubmissionControllerTest {

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000102");

    private final SubmissionService service = mock(SubmissionService.class);
    private final SubmissionController controller = new SubmissionController(service);

    @ParameterizedTest(name = "run should map custom input payload variant {0}")
    @ValueSource(strings = {"5 7", "2\n1 2\n3", ""})
    void runShouldMapPayloadIntoRunRequest(String customInput) {
        when(service.run(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(new RunResponse());

        controller.run(Map.of(
                "problemId", 101,
                "languageKey", "python3",
                "sourceCode", "print(3)",
                "customInput", customInput
        ));

        ArgumentCaptor<com.application.submissionservice.dto.RunRequest> requestCaptor =
                ArgumentCaptor.forClass(com.application.submissionservice.dto.RunRequest.class);
        ArgumentCaptor<String> inputCaptor = ArgumentCaptor.forClass(String.class);
        verify(service).run(requestCaptor.capture(), inputCaptor.capture());
        assertThat(requestCaptor.getValue().getProblemId()).isEqualTo(101L);
        assertThat(requestCaptor.getValue().getLanguageKey()).isEqualTo("python3");
        assertThat(requestCaptor.getValue().getSourceCode()).isEqualTo("print(3)");
        assertThat(inputCaptor.getValue()).isEqualTo(customInput);
    }

    @Test
    void submitShouldForwardHeaderUserId() {
        SubmitRequest request = new SubmitRequest();
        request.setProblemId(101L);
        request.setLanguageKey("java17");
        request.setSourceCode("class Main {}");
        SubmitResponse response = SubmitResponse.builder()
                .submissionId(11L)
                .verdict("ACCEPTED")
                .results(List.of())
                .build();
        when(service.submit(request, USER_ID)).thenReturn(response);

        SubmitResponse actual = controller.submit(request, USER_ID);

        assertThat(actual.submissionId()).isEqualTo(11L);
        verify(service).submit(request, USER_ID);
    }

    @Test
    void getMyRecentSubmissionsShouldForwardFilters() {
        List<SubmissionSummaryResponse> expected = List.of(
                SubmissionSummaryResponse.builder()
                        .id(1L)
                        .problemId(101L)
                        .languageKey("java17")
                        .status(SubmissionStatus.ACCEPTED)
                        .build()
        );
        when(service.getSubmissionHistory(USER_ID, "ACCEPTED", "java17", 101L)).thenReturn(expected);

        List<SubmissionSummaryResponse> actual = controller.getMyRecentSubmissions(USER_ID, "ACCEPTED", "java17", 101L);

        assertThat(actual).hasSize(1);
        verify(service).getSubmissionHistory(USER_ID, "ACCEPTED", "java17", 101L);
    }

    @Test
    void getProblemAttemptSummaryShouldForwardArguments() {
        ProblemAttemptSummaryResponse summary = ProblemAttemptSummaryResponse.builder()
                .problemId(101L)
                .totalAttempts(3)
                .acceptedAttempts(1)
                .latestStatus("ACCEPTED")
                .build();
        when(service.getProblemAttemptSummary(USER_ID, 101L)).thenReturn(summary);

        ProblemAttemptSummaryResponse actual = controller.getProblemAttemptSummary(USER_ID, 101L);

        assertThat(actual.problemId()).isEqualTo(101L);
        verify(service).getProblemAttemptSummary(USER_ID, 101L);
    }

    @Test
    void getSubmissionDetailShouldForwardArguments() {
        SubmissionDetailResponse detail = SubmissionDetailResponse.builder()
                .id(99L)
                .userId(USER_ID)
                .problemId(101L)
                .languageKey("javascript")
                .sourceCode("console.log(1)")
                .status(SubmissionStatus.WRONG_ANSWER)
                .build();
        when(service.getSubmissionDetail(99L, USER_ID)).thenReturn(detail);

        SubmissionDetailResponse actual = controller.getSubmissionDetail(99L, USER_ID);

        assertThat(actual.id()).isEqualTo(99L);
        verify(service).getSubmissionDetail(99L, USER_ID);
    }
}
