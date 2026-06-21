package com.application.resultservice.service;

import com.application.resultservice.client.AttemptServiceClient;
import com.application.resultservice.client.QuestionServiceClient;
import com.application.resultservice.client.QuizServiceClient;
import com.application.resultservice.client.UserProgressClient;
import com.application.resultservice.dto.ActivityProgressUpdateRequest;
import com.application.resultservice.dto.AttemptDetails;
import com.application.resultservice.dto.QuestionAnswerDTO;
import com.application.resultservice.dto.QuizMetadataResponse;
import com.application.resultservice.dto.ResultResponse;
import com.application.resultservice.dto.ResultReviewResponse;
import com.application.resultservice.entity.Result;
import com.application.resultservice.repository.ResultRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResultMicroserviceQaTest {

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000102");
    private static final UUID QUIZ_ID = UUID.fromString("12121212-1212-1212-1212-121212121212");
    private static final UUID ATTEMPT_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID QUESTION_ONE = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID QUESTION_TWO = UUID.fromString("10000000-0000-0000-0000-000000000002");
    private static final UUID QUESTION_THREE = UUID.fromString("10000000-0000-0000-0000-000000000003");
    private static final UUID QUESTION_FOUR = UUID.fromString("10000000-0000-0000-0000-000000000004");

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private AttemptServiceClient attemptClient;

    @Mock
    private QuestionServiceClient questionClient;

    @Mock
    private QuizServiceClient quizServiceClient;

    @Mock
    private UserProgressClient userProgressClient;

    @InjectMocks
    private ResultServiceImpl resultService;

    @Captor
    private ArgumentCaptor<ActivityProgressUpdateRequest> progressCaptor;

    @ParameterizedTest(name = "evaluateAttempt should score scenario {4}/{5}")
    @MethodSource("evaluationScenarios")
    void evaluateAttemptShouldComputeScoreAndPercentage(
            Map<UUID, String> answers,
            String correctOne,
            String correctTwo,
            String correctThree,
            int expectedScore,
            double expectedPercentage
    ) {
        AttemptDetails attempt = AttemptDetails.builder()
                .attemptId(ATTEMPT_ID)
                .userId(USER_ID)
                .quizId(QUIZ_ID)
                .answers(answers)
                .build();

        when(resultRepository.findByAttemptId(ATTEMPT_ID)).thenReturn(Optional.empty());
        when(attemptClient.getAttemptDetails(ATTEMPT_ID)).thenReturn(attempt);
        when(questionClient.getCorrectAnswers(QUIZ_ID)).thenReturn(List.of(
                answer(QUESTION_ONE, correctOne),
                answer(QUESTION_TWO, correctTwo),
                answer(QUESTION_THREE, correctThree)
        ));
        when(resultRepository.save(any(Result.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResultResponse response = resultService.evaluateAttempt(ATTEMPT_ID, USER_ID);

        assertThat(response.getScore()).isEqualTo(expectedScore);
        assertThat(response.getTotalQuestions()).isEqualTo(3);
        assertThat(response.getPercentage()).isEqualTo(expectedPercentage);
        verify(userProgressClient).updateActivityProgress(eq(USER_ID.toString()), eq("ROLE_USER"), progressCaptor.capture());
        assertThat(progressCaptor.getValue().referenceKey()).isEqualTo("quiz-" + QUIZ_ID);
    }

    @ParameterizedTest(name = "duplicate evaluation should reject existing result score {0}")
    @MethodSource("existingResults")
    void evaluateAttemptShouldRejectDuplicateResults(Result existing) {
        when(resultRepository.findByAttemptId(ATTEMPT_ID)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> resultService.evaluateAttempt(ATTEMPT_ID, USER_ID))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");

        verify(userProgressClient, never()).updateActivityProgress(any(), any(), any(ActivityProgressUpdateRequest.class));
    }

    @ParameterizedTest(name = "getResultByAttempt should return existing authorized result variant {0}")
    @MethodSource("existingResults")
    void getResultByAttemptShouldReturnExistingAuthorizedResult(Result existing) {
        when(resultRepository.findByAttemptId(ATTEMPT_ID)).thenReturn(Optional.of(existing));

        ResultResponse response = resultService.getResultByAttempt(ATTEMPT_ID, USER_ID);

        assertThat(response.getAttemptId()).isEqualTo(ATTEMPT_ID);
        assertThat(response.getQuizId()).isEqualTo(QUIZ_ID);
        assertThat(response.getScore()).isEqualTo(existing.getScore());
    }

    @ParameterizedTest(name = "getResultByAttempt should reject unauthorized existing result variant {0}")
    @MethodSource("unauthorizedResults")
    void getResultByAttemptShouldRejectUnauthorizedExistingResult(Result existing) {
        when(resultRepository.findByAttemptId(ATTEMPT_ID)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> resultService.getResultByAttempt(ATTEMPT_ID, USER_ID))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("403 FORBIDDEN");
    }

    @ParameterizedTest(name = "getResultsByUser should filter case {3}")
    @MethodSource("filterScenarios")
    void getResultsByUserShouldFilterByQuizAndMinimumPercentage(
            List<Result> repositoryResults,
            UUID quizFilter,
            Double minimumPercentage,
            int expectedCount
    ) {
        when(resultRepository.findByUserId(USER_ID)).thenReturn(repositoryResults);

        List<ResultResponse> filtered = resultService.getResultsByUser(USER_ID, quizFilter, minimumPercentage);

        assertThat(filtered).hasSize(expectedCount);
    }

    @ParameterizedTest(name = "result review should compute counts and deltas case {3}")
    @MethodSource("reviewScenarios")
    void getResultReviewShouldComputeCountsAndDeltas(
            Map<UUID, String> answers,
            Double previousPercentage,
            Double currentPercentage,
            int expectedUnanswered
    ) {
        Result current = result(currentPercentage == null ? 0 : percentageToScore(currentPercentage), currentPercentage);
        AttemptDetails attempt = AttemptDetails.builder()
                .attemptId(ATTEMPT_ID)
                .userId(USER_ID)
                .quizId(QUIZ_ID)
                .answers(answers)
                .build();
        List<QuestionAnswerDTO> correctAnswers = List.of(
                answer(QUESTION_ONE, "A"),
                answer(QUESTION_TWO, "B"),
                answer(QUESTION_THREE, "C"),
                answer(QUESTION_FOUR, "D")
        );
        Result previous = previousPercentage == null ? null : result(percentageToScore(previousPercentage), previousPercentage, UUID.randomUUID(), LocalDateTime.now().minusDays(1));

        when(resultRepository.findByAttemptId(ATTEMPT_ID)).thenReturn(Optional.of(current));
        when(attemptClient.getAttemptDetails(ATTEMPT_ID)).thenReturn(attempt);
        when(questionClient.getCorrectAnswers(QUIZ_ID)).thenReturn(correctAnswers);
        QuizMetadataResponse metadata = new QuizMetadataResponse();
        metadata.setId(QUIZ_ID);
        metadata.setTitle("DSA Basics Quiz");
        metadata.setCategory("Coding");
        metadata.setSubCategory("Arrays");
        metadata.setDifficulty("MEDIUM");
        when(quizServiceClient.getQuizById(QUIZ_ID, USER_ID.toString(), "ROLE_USER"))
                .thenReturn(metadata);
        when(resultRepository.findByUserId(USER_ID)).thenReturn(previous == null ? List.of(current) : List.of(current, previous));

        ResultReviewResponse review = resultService.getResultReview(ATTEMPT_ID, USER_ID);

        assertThat(review.quizTitle()).isEqualTo("DSA Basics Quiz");
        assertThat(review.unansweredQuestions()).isEqualTo(expectedUnanswered);
        assertThat(review.correctAnswers() + review.incorrectAnswers() + review.unansweredQuestions()).isEqualTo(4);
        if (previous == null) {
            assertThat(review.previousAttemptPercentage()).isNull();
            assertThat(review.percentageDelta()).isNull();
        } else {
            assertThat(review.previousAttemptPercentage()).isEqualTo(previousPercentage);
            assertThat(review.percentageDelta()).isEqualTo(Math.round((currentPercentage - previousPercentage) * 100.0) / 100.0);
        }
    }

    private static Stream<Arguments> evaluationScenarios() {
        return Stream.of(
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "B", QUESTION_THREE, "C"), "A", "B", "C", 3, 100.0),
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "X", QUESTION_THREE, "C"), "A", "B", "C", 2, 66.66666666666667),
                arguments(Map.of(QUESTION_ONE, "X", QUESTION_TWO, "B", QUESTION_THREE, "C"), "A", "B", "C", 2, 66.66666666666667),
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "B", QUESTION_THREE, "X"), "A", "B", "C", 2, 66.66666666666667),
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "X", QUESTION_THREE, "X"), "A", "B", "C", 1, 33.333333333333336),
                arguments(Map.of(QUESTION_ONE, "X", QUESTION_TWO, "B", QUESTION_THREE, "X"), "A", "B", "C", 1, 33.333333333333336),
                arguments(Map.of(QUESTION_ONE, "X", QUESTION_TWO, "X", QUESTION_THREE, "C"), "A", "B", "C", 1, 33.333333333333336),
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "B"), "A", "B", "C", 2, 66.66666666666667),
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_THREE, "C"), "A", "B", "C", 2, 66.66666666666667),
                arguments(Map.of(QUESTION_TWO, "B"), "A", "B", "C", 1, 33.333333333333336),
                arguments(Map.of(QUESTION_THREE, "C"), "A", "B", "C", 1, 33.333333333333336),
                arguments(Map.of(QUESTION_ONE, "a", QUESTION_TWO, "b", QUESTION_THREE, "c"), "A", "B", "C", 0, 0.0),
                arguments(Map.of(QUESTION_ONE, "X", QUESTION_TWO, "X", QUESTION_THREE, "X"), "A", "B", "C", 0, 0.0)
        );
    }

    private static Stream<Result> existingResults() {
        return Stream.of(
                result(4, 100.0),
                result(3, 75.0),
                result(2, 50.0),
                result(1, 25.0),
                result(0, 0.0)
        );
    }

    private static Stream<Result> unauthorizedResults() {
        return Stream.of(
                result(4, 100.0, ATTEMPT_ID, QUIZ_ID, UUID.randomUUID(), LocalDateTime.now()),
                result(3, 75.0, ATTEMPT_ID, QUIZ_ID, UUID.randomUUID(), LocalDateTime.now()),
                result(2, 50.0, ATTEMPT_ID, QUIZ_ID, UUID.randomUUID(), LocalDateTime.now()),
                result(1, 25.0, ATTEMPT_ID, QUIZ_ID, UUID.randomUUID(), LocalDateTime.now())
        );
    }

    private static Stream<Arguments> filterScenarios() {
        UUID otherQuiz = UUID.fromString("13131313-1313-1313-1313-131313131313");
        List<Result> repositoryResults = List.of(
                result(4, 100.0),
                result(3, 75.0, ATTEMPT_ID, QUIZ_ID, USER_ID, LocalDateTime.now().minusDays(1)),
                result(2, 50.0, UUID.randomUUID(), otherQuiz, USER_ID, LocalDateTime.now().minusDays(2)),
                result(1, 25.0, UUID.randomUUID(), otherQuiz, USER_ID, LocalDateTime.now().minusDays(3))
        );
        return Stream.of(
                arguments(repositoryResults, null, null, 4),
                arguments(repositoryResults, QUIZ_ID, null, 2),
                arguments(repositoryResults, otherQuiz, null, 2),
                arguments(repositoryResults, null, 80.0, 1),
                arguments(repositoryResults, QUIZ_ID, 70.0, 2),
                arguments(repositoryResults, otherQuiz, 30.0, 1),
                arguments(repositoryResults, otherQuiz, 60.0, 0),
                arguments(repositoryResults, QUIZ_ID, 101.0, 0)
        );
    }

    private static Stream<Arguments> reviewScenarios() {
        return Stream.of(
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "B", QUESTION_THREE, "C", QUESTION_FOUR, "D"), null, 100.0, 0),
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "B", QUESTION_THREE, "C"), 50.0, 75.0, 1),
                arguments(Map.of(QUESTION_ONE, "A", QUESTION_TWO, "X", QUESTION_THREE, "C"), 25.0, 50.0, 1),
                arguments(Map.of(QUESTION_ONE, "A"), 75.0, 25.0, 3),
                arguments(Map.of(), 0.0, 0.0, 4)
        );
    }

    private static QuestionAnswerDTO answer(UUID questionId, String correctOption) {
        QuestionAnswerDTO dto = new QuestionAnswerDTO();
        dto.setQuestionId(questionId);
        dto.setCorrectOption(correctOption);
        return dto;
    }

    private static Result result(int score, double percentage) {
        return result(score, percentage, ATTEMPT_ID, LocalDateTime.now());
    }

    private static Result result(int score, double percentage, UUID attemptId, LocalDateTime evaluatedAt) {
        return result(score, percentage, attemptId, QUIZ_ID, USER_ID, evaluatedAt);
    }

    private static Result result(int score, double percentage, UUID attemptId, UUID quizId, UUID userId, LocalDateTime evaluatedAt) {
        return Result.builder()
                .attemptId(attemptId)
                .userId(userId)
                .quizId(quizId)
                .score(score)
                .totalQuestions(4)
                .percentage(percentage)
                .evaluatedAt(evaluatedAt)
                .build();
    }

    private static int percentageToScore(double percentage) {
        return (int) Math.round((percentage / 100.0) * 4);
    }
}
