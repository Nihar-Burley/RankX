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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.UUID;
import java.util.Comparator;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ResultServiceImpl implements ResultService {

    private final ResultRepository resultRepository;
    private final AttemptServiceClient attemptClient;
    private final QuestionServiceClient questionClient;
    private final QuizServiceClient quizServiceClient;
    private final UserProgressClient userProgressClient;

    @Override
    public ResultResponse evaluateAttempt(UUID attemptId, UUID userId) {
        resultRepository.findByAttemptId(attemptId)
                .ifPresent(r -> {
                    throw new IllegalStateException("Result already exists");
                });

        AttemptDetails attempt = attemptClient.getAttemptDetails(attemptId);
        if (!attempt.getUserId().equals(userId)) {
            throw new ResponseStatusException(FORBIDDEN, "Unauthorized result evaluation");
        }

        List<QuestionAnswerDTO> correctAnswers =
                questionClient.getCorrectAnswers(attempt.getQuizId());

        int score = 0;
        for (QuestionAnswerDTO q : correctAnswers) {
            String userAnswer = attempt.getAnswers().get(q.getQuestionId());
            if (q.getCorrectOption().equals(userAnswer)) {
                score++;
            }
        }

        int total = correctAnswers.size();
        double percentage = total == 0 ? 0.0 : (score * 100.0) / total;

        Result result = Result.builder()
                .attemptId(attemptId)
                .userId(attempt.getUserId())
                .quizId(attempt.getQuizId())
                .score(score)
                .totalQuestions(total)
                .percentage(percentage)
                .build();

        resultRepository.save(result);
        notifyProgressUpdate(result);
        log.info("Evaluated result for attempt {} and user {}", attemptId, userId);
        return mapToResponse(result);
    }

    @Override
    public ResultResponse getResultByAttempt(UUID attemptId, UUID userId) {
        return resultRepository.findByAttemptId(attemptId)
                .map(result -> {
                    if (!result.getUserId().equals(userId)) {
                        throw new ResponseStatusException(FORBIDDEN, "Unauthorized result access");
                    }
                    return mapToResponse(result);
                })
                .orElseGet(() -> evaluateAttempt(attemptId, userId));
    }

    @Override
    public List<ResultResponse> getResultsByUser(UUID userId, UUID quizId, Double minimumPercentage) {
        return resultRepository.findByUserId(userId)
                .stream()
                .filter(result -> quizId == null || quizId.equals(result.getQuizId()))
                .filter(result -> minimumPercentage == null || (result.getPercentage() != null && result.getPercentage() >= minimumPercentage))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ResultReviewResponse getResultReview(UUID attemptId, UUID userId) {
        ResultResponse result = getResultByAttempt(attemptId, userId);
        AttemptDetails attempt = attemptClient.getAttemptDetails(attemptId);

        if (!attempt.getUserId().equals(userId)) {
            throw new ResponseStatusException(FORBIDDEN, "Unauthorized review access");
        }

        List<QuestionAnswerDTO> correctAnswers =
                questionClient.getCorrectAnswers(attempt.getQuizId());
        QuizMetadataResponse quizMetadata = fetchQuizMetadata(result.getQuizId(), userId);
        List<Result> priorResults = resultRepository.findByUserId(userId).stream()
                .filter(existing -> existing.getQuizId().equals(result.getQuizId()))
                .filter(existing -> !existing.getAttemptId().equals(attemptId))
                .sorted(Comparator.comparing(Result::getEvaluatedAt))
                .toList();

        Map<UUID, String> selectedAnswers = attempt.getAnswers();
        AtomicInteger questionCounter = new AtomicInteger(1);

        List<ResultReviewResponse.QuestionReview> reviews = correctAnswers.stream()
                .map(answer -> {
                    String selectedOption = selectedAnswers.get(answer.getQuestionId());
                    String correctOption = answer.getCorrectOption();
                    return ResultReviewResponse.QuestionReview.builder()
                            .questionId(answer.getQuestionId())
                            .questionNumber(questionCounter.getAndIncrement())
                            .selectedOption(selectedOption)
                            .correctOption(correctOption)
                            .correct(correctOption.equals(selectedOption))
                            .build();
                })
                .toList();
        int correctCount = (int) reviews.stream().filter(ResultReviewResponse.QuestionReview::correct).count();
        int unansweredCount = (int) reviews.stream()
                .filter(question -> question.selectedOption() == null)
                .count();
        Double previousAttemptPercentage = priorResults.isEmpty()
                ? null
                : priorResults.get(priorResults.size() - 1).getPercentage();
        Double bestPreviousPercentage = priorResults.stream()
                .map(Result::getPercentage)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(null);
        Double percentageDelta = previousAttemptPercentage == null
                ? null
                : round(result.getPercentage() - previousAttemptPercentage);

        return ResultReviewResponse.builder()
                .attemptId(result.getAttemptId())
                .quizId(result.getQuizId())
                .quizTitle(quizMetadata == null ? null : quizMetadata.getTitle())
                .category(quizMetadata == null ? null : quizMetadata.getCategory())
                .subCategory(quizMetadata == null ? null : quizMetadata.getSubCategory())
                .difficulty(quizMetadata == null ? null : quizMetadata.getDifficulty())
                .score(result.getScore())
                .totalQuestions(result.getTotalQuestions())
                .percentage(result.getPercentage())
                .previousAttemptPercentage(previousAttemptPercentage)
                .bestPreviousPercentage(bestPreviousPercentage)
                .percentageDelta(percentageDelta)
                .priorAttempts(priorResults.size())
                .correctAnswers(correctCount)
                .incorrectAnswers(reviews.size() - correctCount - unansweredCount)
                .unansweredQuestions(unansweredCount)
                .questions(reviews)
                .build();
    }

    private ResultResponse mapToResponse(Result r) {
        return ResultResponse.builder()
                .attemptId(r.getAttemptId())
                .quizId(r.getQuizId())
                .score(r.getScore())
                .totalQuestions(r.getTotalQuestions())
                .percentage(r.getPercentage())
                .evaluatedAt(r.getEvaluatedAt())
                .build();
    }

    private void notifyProgressUpdate(Result result) {
        try {
            userProgressClient.updateActivityProgress(
                    result.getUserId().toString(),
                    "ROLE_USER",
                    ActivityProgressUpdateRequest.builder()
                            .itemType("QUIZ")
                            .referenceKey("quiz-" + result.getQuizId())
                            .sourceEventId("attempt-" + result.getAttemptId())
                            .build()
            );
            log.info("Progress sync sent for evaluated attempt {} and user {}", result.getAttemptId(), result.getUserId());
        } catch (Exception ex) {
            log.warn("Failed to sync progress for evaluated attempt {} and user {}", result.getAttemptId(), result.getUserId(), ex);
        }
    }

    private QuizMetadataResponse fetchQuizMetadata(UUID quizId, UUID userId) {
        try {
            return quizServiceClient.getQuizById(quizId, userId.toString(), "ROLE_USER");
        } catch (Exception ex) {
            log.warn("Failed to fetch quiz metadata for {}", quizId, ex);
            return null;
        }
    }

    private Double round(Double value) {
        if (value == null) {
            return null;
        }
        return Math.round(value * 100.0) / 100.0;
    }
}
