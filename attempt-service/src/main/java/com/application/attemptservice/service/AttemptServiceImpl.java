package com.application.attemptservice.service;

import com.application.attemptservice.dto.AnswerRequest;
import com.application.attemptservice.entity.Answer;
import com.application.attemptservice.entity.Attempt;
import com.application.attemptservice.entity.AttemptStatus;
import com.application.attemptservice.repository.AnswerRepository;
import com.application.attemptservice.repository.AttemptRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AttemptServiceImpl implements AttemptService {

    private final AttemptRepository attemptRepository;
    private final AnswerRepository answerRepository;

    @Override
    public UUID startAttempt(UUID quizId, UUID userId) {

        return attemptRepository
                .findFirstByUserIdAndQuizIdAndStatusOrderByStartedAtDesc(
                        userId,
                        quizId,
                        AttemptStatus.IN_PROGRESS
                )
                .map(Attempt::getId)
                .orElseGet(() -> {
                    Attempt attempt = Attempt.builder()
                            .userId(userId)   // ✅ correct now
                            .quizId(quizId)
                            .status(AttemptStatus.IN_PROGRESS)
                            .startedAt(LocalDateTime.now())
                            .build();

                    return attemptRepository.save(attempt).getId();
                });
    }



    @Override
    public void saveAnswer(UUID attemptId, UUID userId, AnswerRequest request) {

        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized attempt access");
        }

        if (attempt.getStatus() == AttemptStatus.SUBMITTED) {
            throw new IllegalStateException("Cannot answer after submission");
        }

        Answer answer = answerRepository
                .findByAttemptAndQuestionId(attempt, request.getQuestionId())
                .orElseGet(() -> new Answer(null, attempt, request.getQuestionId(), null));

        answer.setSelectedOption(request.getSelectedOption());
        answerRepository.save(answer);
    }

    @Override
    public void submitAttempt(UUID attemptId, UUID userId) {

        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized attempt submission");
        }

        attempt.setStatus(AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());

        attemptRepository.save(attempt);
    }
}
