package com.application.attemptservice.service;

import com.application.attemptservice.dto.AnswerRequest;

import java.util.UUID;

public interface AttemptService {

    UUID startAttempt(UUID quizId, UUID userId);

    void saveAnswer(UUID attemptId, UUID userId, AnswerRequest request);

    void submitAttempt(UUID attemptId, UUID userId);
}

