package com.application.userservice.service;

import com.application.userservice.dto.AdminKpiDashboardResponse;
import com.application.userservice.dto.ProductEventRequest;
import com.application.userservice.dto.ProductEventResponse;
import com.application.userservice.entity.ProductEvent;
import com.application.userservice.repository.ProductEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductEventServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private ProductEventRepository productEventRepository;

    private ProductEventService productEventService;

    @BeforeEach
    void setUp() {
        productEventService = new ProductEventService(productEventRepository, new ObjectMapper());
    }

    @Test
    void shouldStoreProductEvent() {
        when(productEventRepository.save(any(ProductEvent.class))).thenAnswer(invocation -> {
            ProductEvent event = invocation.getArgument(0);
            event.setId(11L);
            return event;
        });

        ProductEventResponse response = productEventService.ingest(
                USER_ID,
                "ROLE_USER",
                ProductEventRequest.builder()
                        .eventName("auth.login_success")
                        .eventCategory("AUTH")
                        .source("WEB")
                        .metadata(Map.of("screen", "login"))
                        .build()
        );

        assertThat(response.isAccepted()).isTrue();
        assertThat(response.getEventCategory()).isEqualTo("AUTH");
        assertThat(response.getId()).isEqualTo(11L);
    }

    @Test
    void shouldBuildKpiDashboard() {
        UUID secondUser = UUID.randomUUID();
        when(productEventRepository.findAll()).thenReturn(List.of(
                event(USER_ID, "AUTH_LOGIN_SUCCESS", "AUTH", null, null, null, null, LocalDateTime.now().minusDays(1)),
                event(USER_ID, "ONBOARDING_COMPLETED", "ONBOARDING", null, null, null, null, LocalDateTime.now().minusHours(8)),
                event(USER_ID, "CODING_SUBMISSION_RESULT", "CODING", "PROBLEM", "problem-1", "Two Sum", "ACCEPTED", LocalDateTime.now().minusHours(4)),
                event(secondUser, "QUIZ_ATTEMPT_STARTED", "QUIZ", "QUIZ", "quiz-1", "Java Basics", null, LocalDateTime.now().minusDays(2)),
                event(secondUser, "QUIZ_ATTEMPT_SUBMITTED", "QUIZ", "QUIZ", "quiz-1", "Java Basics", "SUBMITTED", LocalDateTime.now().minusHours(2)),
                event(USER_ID, "PROGRESS_DASHBOARD_VIEWED", "PROGRESS", null, null, null, null, LocalDateTime.now().minusHours(1))
        ));

        AdminKpiDashboardResponse response = productEventService.getKpiDashboard();

        assertThat(response.getTotalTrackedUsers()).isEqualTo(2);
        assertThat(response.getLoginEvents()).isEqualTo(1);
        assertThat(response.getOnboardingCompletions()).isEqualTo(1);
        assertThat(response.getCodingEvents()).isEqualTo(1);
        assertThat(response.getQuizEvents()).isEqualTo(2);
        assertThat(response.getProgressEvents()).isEqualTo(1);
        assertThat(response.getHighlights()).hasSize(3);
    }

    @Test
    void shouldBuildProblemAnalytics() {
        UUID secondUser = UUID.randomUUID();
        when(productEventRepository.findAll()).thenReturn(List.of(
                event(USER_ID, "CODING_SUBMISSION_RESULT", "CODING", "PROBLEM", "problem-1", "Two Sum", "ACCEPTED", LocalDateTime.now().minusDays(1)),
                event(USER_ID, "CODING_SUBMISSION_RESULT", "CODING", "PROBLEM", "problem-1", "Two Sum", "WRONG_ANSWER", LocalDateTime.now().minusHours(8)),
                event(secondUser, "CODING_SUBMISSION_RESULT", "CODING", "PROBLEM", "problem-2", "Binary Search", "ACCEPTED", LocalDateTime.now().minusHours(3))
        ));

        AdminKpiDashboardResponse.ContentAnalyticsResponse response = productEventService.getProblemAnalytics();

        assertThat(response.getTotalTrackedItems()).isEqualTo(2);
        assertThat(response.getMostAttempted().getContentId()).isEqualTo("problem-1");
        assertThat(response.getMostAttempted().getAcceptanceRate()).isEqualTo(50.0);
    }

    @Test
    void shouldBuildQuestionAnalyticsWithQuizStartBaseline() {
        when(productEventRepository.findAll()).thenReturn(List.of(
                event(USER_ID, "QUIZ_ATTEMPT_STARTED", "QUIZ", "QUIZ", "quiz-1", "Quiz 1", null, LocalDateTime.now().minusDays(1)),
                event(USER_ID, "QUIZ_QUESTION_ANSWERED", "QUIZ", "QUESTION", "question-1", "Question 1", "ANSWERED", LocalDateTime.now().minusHours(6), "quiz-1"),
                event(USER_ID, "QUIZ_QUESTION_ANSWERED", "QUIZ", "QUESTION", "question-2", "Question 2", "ANSWERED", LocalDateTime.now().minusHours(5), "quiz-1")
        ));

        AdminKpiDashboardResponse.ContentAnalyticsResponse response = productEventService.getQuestionAnalytics();

        assertThat(response.getTotalTrackedItems()).isEqualTo(2);
        assertThat(response.getMostAttempted().getCompletionRate()).isEqualTo(100.0);
    }

    @Test
    void shouldHandleEmptyAnalyticsData() {
        when(productEventRepository.findAll()).thenReturn(List.of());

        AdminKpiDashboardResponse.ContentAnalyticsResponse response = productEventService.getQuizAnalytics();

        assertThat(response.getTotalTrackedItems()).isZero();
        assertThat(response.getItems()).isEmpty();
        assertThat(response.getAverageCompletionRate()).isEqualTo(0.0);
    }

    @Test
    void shouldNormalizeEventFields() {
        when(productEventRepository.save(any(ProductEvent.class))).thenAnswer(invocation -> {
            ProductEvent event = invocation.getArgument(0);
            event.setId(21L);
            return event;
        });

        ProductEventResponse response = productEventService.ingest(
                USER_ID,
                "ROLE_USER",
                ProductEventRequest.builder()
                        .eventName("dashboard viewed")
                        .eventCategory("progress")
                        .source("web app")
                        .track("coding")
                        .contentType("problem")
                        .outcome("accepted")
                        .metadata(Map.of("surface", "home"))
                        .build()
        );

        assertThat(response.getId()).isEqualTo(21L);
        assertThat(response.getEventName()).isEqualTo("DASHBOARD_VIEWED");
        assertThat(response.getEventCategory()).isEqualTo("PROGRESS");
    }

    private ProductEvent event(
            UUID userId,
            String eventName,
            String eventCategory,
            String contentType,
            String contentId,
            String contentTitle,
            String outcome,
            LocalDateTime occurredAt
    ) {
        return event(userId, eventName, eventCategory, contentType, contentId, contentTitle, outcome, occurredAt, null);
    }

    private ProductEvent event(
            UUID userId,
            String eventName,
            String eventCategory,
            String contentType,
            String contentId,
            String contentTitle,
            String outcome,
            LocalDateTime occurredAt,
            String parentContentId
    ) {
        return ProductEvent.builder()
                .id(System.nanoTime())
                .userId(userId)
                .role("ROLE_USER")
                .eventName(eventName)
                .eventCategory(eventCategory)
                .contentType(contentType)
                .contentId(contentId)
                .contentTitle(contentTitle)
                .outcome(outcome)
                .occurredAt(occurredAt)
                .recordedAt(occurredAt)
                .parentContentId(parentContentId)
                .build();
    }
}
