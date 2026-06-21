package com.application.userservice.service;

import com.application.userservice.client.ProblemServiceClient;
import com.application.userservice.client.QuizServiceClient;
import com.application.userservice.client.ResultServiceClient;
import com.application.userservice.client.SubmissionServiceClient;
import com.application.userservice.dto.ProblemMetadataView;
import com.application.userservice.dto.ProgressSummaryResponse;
import com.application.userservice.dto.QuizMetadataView;
import com.application.userservice.dto.ResultAnalyticsView;
import com.application.userservice.dto.SubmissionAnalyticsView;
import com.application.userservice.dto.UserAnalyticsResponse;
import com.application.userservice.dto.UserPreferenceResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserAnalyticsServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private SubmissionServiceClient submissionServiceClient;

    @Mock
    private ResultServiceClient resultServiceClient;

    @Mock
    private ProblemServiceClient problemServiceClient;

    @Mock
    private QuizServiceClient quizServiceClient;

    @Mock
    private UserPreferenceService userPreferenceService;

    @Mock
    private StudyPlanService studyPlanService;

    @InjectMocks
    private UserAnalyticsService userAnalyticsService;

    @Test
    void shouldCalculateAnalyticsAndRecommendations() {
        SubmissionAnalyticsView acceptedSubmission = new SubmissionAnalyticsView();
        acceptedSubmission.setId(1L);
        acceptedSubmission.setProblemId(101L);
        acceptedSubmission.setLanguageKey("java");
        acceptedSubmission.setStatus("ACCEPTED");
        acceptedSubmission.setRuntimeMs(120);
        acceptedSubmission.setMemoryKb(256);
        acceptedSubmission.setCreatedAt(LocalDateTime.now().minusDays(1));

        SubmissionAnalyticsView failedSubmission = new SubmissionAnalyticsView();
        failedSubmission.setId(2L);
        failedSubmission.setProblemId(102L);
        failedSubmission.setLanguageKey("java");
        failedSubmission.setStatus("WRONG_ANSWER");
        failedSubmission.setRuntimeMs(180);
        failedSubmission.setMemoryKb(300);
        failedSubmission.setCreatedAt(LocalDateTime.now());

        ResultAnalyticsView quizResult = new ResultAnalyticsView();
        quizResult.setAttemptId(UUID.randomUUID());
        quizResult.setQuizId(UUID.randomUUID());
        quizResult.setScore(4);
        quizResult.setTotalQuestions(10);
        quizResult.setPercentage(40.0);
        quizResult.setEvaluatedAt(LocalDateTime.now().minusHours(3));

        ProblemMetadataView arraysProblem = new ProblemMetadataView();
        arraysProblem.setId(101L);
        arraysProblem.setTags(List.of("Arrays"));

        ProblemMetadataView dpProblem = new ProblemMetadataView();
        dpProblem.setId(102L);
        dpProblem.setTags(List.of("Dynamic Programming"));

        QuizMetadataView quizMetadata = new QuizMetadataView();
        quizMetadata.setId(quizResult.getQuizId());
        quizMetadata.setCategory("Java");
        quizMetadata.setSubCategory("Collections");

        when(submissionServiceClient.getSubmissionHistory(USER_ID.toString())).thenReturn(List.of(acceptedSubmission, failedSubmission));
        when(resultServiceClient.getResults(USER_ID.toString(), "ROLE_USER")).thenReturn(List.of(quizResult));
        when(problemServiceClient.getProblemById(101L)).thenReturn(arraysProblem);
        when(problemServiceClient.getProblemById(102L)).thenReturn(dpProblem);
        when(quizServiceClient.getQuizById(quizResult.getQuizId(), USER_ID.toString(), "ROLE_USER")).thenReturn(quizMetadata);
        when(userPreferenceService.getPreferences(USER_ID)).thenReturn(UserPreferenceResponse.builder()
                .userId(USER_ID.toString())
                .goal("Interview Prep")
                .preferredTrack("Both")
                .skillLevel("Intermediate")
                .onboardingCompleted(true)
                .build());
        when(studyPlanService.getProgressSummary(USER_ID)).thenReturn(ProgressSummaryResponse.builder()
                .enrolledPlans(0)
                .streakCount(2)
                .build());
        when(studyPlanService.countCompletedItems(USER_ID)).thenReturn(1L);
        when(studyPlanService.getCurrentNextItem(USER_ID)).thenReturn(null);

        UserAnalyticsResponse response = userAnalyticsService.getAnalytics(USER_ID, "ROLE_USER");

        assertThat(response.getCodingPerformance().getTotalSubmissions()).isEqualTo(2);
        assertThat(response.getCodingPerformance().getAcceptedSubmissions()).isEqualTo(1);
        assertThat(response.getQuizPerformance().getAveragePercentage()).isEqualTo(40.0);
        assertThat(response.getActivitySummary().getLatestQuizActivityAt()).isEqualTo(quizResult.getEvaluatedAt());
        assertThat(response.getActivitySummary().getLatestOverallActivityAt()).isEqualTo(failedSubmission.getCreatedAt());
        assertThat(response.getActivitySummary().getTotalCompletedPlanItems()).isEqualTo(1);
        assertThat(response.getCodingPerformance().getWeakTopics()).extracting("topic").contains("Dynamic Programming");
        assertThat(response.getQuizPerformance().getWeakTopics()).extracting("topic").contains("Collections");
        assertThat(response.getRecommendations()).isNotEmpty();
        assertThat(response.getPrimaryRecommendation()).isNotNull();
    }

    @Test
    void shouldHandleNewUserWithNoActivity() {
        when(submissionServiceClient.getSubmissionHistory(USER_ID.toString())).thenReturn(List.of());
        when(resultServiceClient.getResults(USER_ID.toString(), "ROLE_USER")).thenReturn(List.of());
        when(userPreferenceService.getPreferences(USER_ID)).thenReturn(UserPreferenceResponse.builder()
                .userId(USER_ID.toString())
                .onboardingCompleted(false)
                .build());
        when(studyPlanService.getProgressSummary(USER_ID)).thenReturn(ProgressSummaryResponse.builder()
                .enrolledPlans(0)
                .streakCount(0)
                .build());
        when(studyPlanService.countCompletedItems(USER_ID)).thenReturn(0L);
        when(studyPlanService.getCurrentNextItem(USER_ID)).thenReturn(null);

        UserAnalyticsResponse response = userAnalyticsService.getAnalytics(USER_ID, "ROLE_USER");

        assertThat(response.getActivitySummary().getLatestQuizActivityAt()).isNull();
        assertThat(response.getActivitySummary().getLatestCodingActivityAt()).isNull();
        assertThat(response.getActivitySummary().getLatestOverallActivityAt()).isNull();
        assertThat(response.getRecommendations()).extracting("title")
                .contains("Complete onboarding", "Join a study plan");
    }

    @Test
    void shouldPreferUnfinishedStudyPlanItemRecommendation() {
        when(submissionServiceClient.getSubmissionHistory(USER_ID.toString())).thenReturn(List.of());
        when(resultServiceClient.getResults(USER_ID.toString(), "ROLE_USER")).thenReturn(List.of());
        when(userPreferenceService.getPreferences(USER_ID)).thenReturn(UserPreferenceResponse.builder()
                .userId(USER_ID.toString())
                .goal("Interview Prep")
                .preferredTrack("Coding")
                .skillLevel("Intermediate")
                .onboardingCompleted(true)
                .build());
        when(studyPlanService.getProgressSummary(USER_ID)).thenReturn(ProgressSummaryResponse.builder()
                .enrolledPlans(1)
                .streakCount(4)
                .currentPlan(ProgressSummaryResponse.CurrentPlan.builder()
                        .studyPlanId(10L)
                        .title("DSA Basics")
                        .completionPercentage(40.0)
                        .nextItemTitle("Arrays warmup")
                        .build())
                .build());
        when(studyPlanService.countCompletedItems(USER_ID)).thenReturn(2L);
        when(studyPlanService.getCurrentNextItem(USER_ID)).thenReturn(
                new StudyPlanService.StudyPlanNextItemView(
                        10L,
                        "DSA Basics",
                        11L,
                        "Arrays warmup",
                        "CODING_PROBLEM",
                        "problem-101",
                        40.0,
                        "Intermediate"
                )
        );

        UserAnalyticsResponse response = userAnalyticsService.getAnalytics(USER_ID, "ROLE_USER");

        assertThat(response.getPrimaryRecommendation().getRecommendationType()).isEqualTo("STUDY_PLAN_NEXT_ITEM");
        assertThat(response.getPrimaryRecommendation().getReason()).contains("Unfinished study plan item");
    }

    @Test
    void shouldRecommendAfterInactivity() {
        SubmissionAnalyticsView oldSubmission = new SubmissionAnalyticsView();
        oldSubmission.setCreatedAt(LocalDateTime.now().minusDays(8));
        oldSubmission.setStatus("ACCEPTED");
        oldSubmission.setProblemId(101L);

        when(submissionServiceClient.getSubmissionHistory(USER_ID.toString())).thenReturn(List.of(oldSubmission));
        when(resultServiceClient.getResults(USER_ID.toString(), "ROLE_USER")).thenReturn(List.of());
        when(problemServiceClient.getProblemById(101L)).thenReturn(new ProblemMetadataView());
        when(userPreferenceService.getPreferences(USER_ID)).thenReturn(UserPreferenceResponse.builder()
                .userId(USER_ID.toString())
                .goal("Skill Improvement")
                .preferredTrack("Coding")
                .skillLevel("Beginner")
                .onboardingCompleted(true)
                .build());
        when(studyPlanService.getProgressSummary(USER_ID)).thenReturn(ProgressSummaryResponse.builder()
                .enrolledPlans(0)
                .streakCount(0)
                .build());
        when(studyPlanService.countCompletedItems(USER_ID)).thenReturn(0L);
        when(studyPlanService.getCurrentNextItem(USER_ID)).thenReturn(null);

        UserAnalyticsResponse response = userAnalyticsService.getAnalytics(USER_ID, "ROLE_USER");

        assertThat(response.getRecommendations()).extracting("recommendationType").contains("INACTIVITY");
    }

    @Test
    void shouldRecommendRepeatedTopicFailure() {
        SubmissionAnalyticsView failedOne = new SubmissionAnalyticsView();
        failedOne.setProblemId(101L);
        failedOne.setStatus("WRONG_ANSWER");
        failedOne.setCreatedAt(LocalDateTime.now().minusDays(1));

        SubmissionAnalyticsView failedTwo = new SubmissionAnalyticsView();
        failedTwo.setProblemId(102L);
        failedTwo.setStatus("TIME_LIMIT_EXCEEDED");
        failedTwo.setCreatedAt(LocalDateTime.now());

        ProblemMetadataView dpProblem = new ProblemMetadataView();
        dpProblem.setTags(List.of("Dynamic Programming"));

        when(submissionServiceClient.getSubmissionHistory(USER_ID.toString())).thenReturn(List.of(failedOne, failedTwo));
        when(resultServiceClient.getResults(USER_ID.toString(), "ROLE_USER")).thenReturn(List.of());
        when(problemServiceClient.getProblemById(101L)).thenReturn(dpProblem);
        when(problemServiceClient.getProblemById(102L)).thenReturn(dpProblem);
        when(userPreferenceService.getPreferences(USER_ID)).thenReturn(UserPreferenceResponse.builder()
                .userId(USER_ID.toString())
                .goal("Interview Prep")
                .preferredTrack("Coding")
                .skillLevel("Intermediate")
                .onboardingCompleted(true)
                .build());
        when(studyPlanService.getProgressSummary(USER_ID)).thenReturn(ProgressSummaryResponse.builder()
                .enrolledPlans(0)
                .streakCount(1)
                .build());
        when(studyPlanService.countCompletedItems(USER_ID)).thenReturn(0L);
        when(studyPlanService.getCurrentNextItem(USER_ID)).thenReturn(null);

        UserAnalyticsResponse response = userAnalyticsService.getAnalytics(USER_ID, "ROLE_USER");

        assertThat(response.getRecommendations().stream()
                .map(recommendation -> recommendation.getReason())
                .toList())
                .anyMatch(reason -> reason.contains("Dynamic Programming"));
    }

    @Test
    void shouldRecommendDifficultyProgression() {
        SubmissionAnalyticsView acceptedOne = new SubmissionAnalyticsView();
        acceptedOne.setProblemId(101L);
        acceptedOne.setStatus("ACCEPTED");
        acceptedOne.setCreatedAt(LocalDateTime.now().minusHours(10));

        SubmissionAnalyticsView acceptedTwo = new SubmissionAnalyticsView();
        acceptedTwo.setProblemId(102L);
        acceptedTwo.setStatus("ACCEPTED");
        acceptedTwo.setCreatedAt(LocalDateTime.now().minusHours(2));

        ProblemMetadataView arraysProblem = new ProblemMetadataView();
        arraysProblem.setTags(List.of("Arrays"));

        when(submissionServiceClient.getSubmissionHistory(USER_ID.toString())).thenReturn(List.of(acceptedOne, acceptedTwo));
        when(resultServiceClient.getResults(USER_ID.toString(), "ROLE_USER")).thenReturn(List.of());
        when(problemServiceClient.getProblemById(101L)).thenReturn(arraysProblem);
        when(problemServiceClient.getProblemById(102L)).thenReturn(arraysProblem);
        when(userPreferenceService.getPreferences(USER_ID)).thenReturn(UserPreferenceResponse.builder()
                .userId(USER_ID.toString())
                .goal("Skill Improvement")
                .preferredTrack("Coding")
                .skillLevel("Beginner")
                .onboardingCompleted(true)
                .build());
        when(studyPlanService.getProgressSummary(USER_ID)).thenReturn(ProgressSummaryResponse.builder()
                .enrolledPlans(1)
                .streakCount(3)
                .currentPlan(ProgressSummaryResponse.CurrentPlan.builder()
                        .studyPlanId(20L)
                        .title("Foundations")
                        .completionPercentage(85.0)
                        .nextItemTitle("Next challenge")
                        .build())
                .build());
        when(studyPlanService.countCompletedItems(USER_ID)).thenReturn(5L);
        when(studyPlanService.getCurrentNextItem(USER_ID)).thenReturn(null);

        UserAnalyticsResponse response = userAnalyticsService.getAnalytics(USER_ID, "ROLE_USER");

        assertThat(response.getRecommendations()).extracting("recommendationType")
                .contains("DIFFICULTY_PROGRESSION");
        assertThat(response.getRecommendations().stream()
                .map(recommendation -> recommendation.getReason())
                .toList())
                .anyMatch(reason -> reason.contains("Difficulty progression"));
    }
}
