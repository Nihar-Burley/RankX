package com.application.resultservice.service;

import com.application.resultservice.client.AttemptServiceClient;
import com.application.resultservice.client.QuestionServiceClient;
import com.application.resultservice.dto.AttemptDetails;
import com.application.resultservice.dto.QuestionAnswerDTO;
import com.application.resultservice.dto.ResultResponse;
import com.application.resultservice.entity.Result;
import com.application.resultservice.repository.ResultRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ResultServiceImpl implements ResultService {

    private final ResultRepository resultRepository;
    private final AttemptServiceClient attemptClient;
    private final QuestionServiceClient questionClient;

    @Override
    public ResultResponse evaluateAttempt(UUID attemptId, UUID userId) {
        resultRepository.findByAttemptId(attemptId)
                .ifPresent(r -> {
                    throw new IllegalStateException("Result already exists");
                });

        AttemptDetails attempt = attemptClient.getAttemptDetails(attemptId);
        if (!attempt.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized result evaluation");
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
        return mapToResponse(result);
    }

    @Override
    public ResultResponse getResultByAttempt(UUID attemptId, UUID userId) {
        return resultRepository.findByAttemptId(attemptId)
                .map(result -> {
                    if (!result.getUserId().equals(userId)) {
                        throw new SecurityException("Unauthorized result access");
                    }
                    return mapToResponse(result);
                })
                .orElseGet(() -> evaluateAttempt(attemptId, userId));
    }

    @Override
    public List<ResultResponse> getResultsByUser(UUID userId) {
        return resultRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ResultResponse mapToResponse(Result r) {
        return ResultResponse.builder()
                .attemptId(r.getAttemptId())
                .quizId(r.getQuizId())
                .score(r.getScore())
                .totalQuestions(r.getTotalQuestions())
                .percentage(r.getPercentage())
                .build();
    }
}
