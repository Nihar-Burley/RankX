package com.application.attemptservice.controller;

import com.application.attemptservice.dto.AnswerRequest;
import com.application.attemptservice.dto.StartAttemptRequest;
import com.application.attemptservice.service.AttemptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
@Slf4j
public class AttemptController {

    private final AttemptService attemptService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/start")
    public ResponseEntity<UUID> startAttempt(
            @RequestBody StartAttemptRequest request,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        log.info("Creating attempt for userId={}", userId);

        return ResponseEntity.ok(
                attemptService.startAttempt(request.getQuizId(), userId)
        );
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/{attemptId}/answer")
    public ResponseEntity<Void> saveAnswer(
            @PathVariable UUID attemptId,
            @RequestBody AnswerRequest request,
            Authentication authentication
    ) {
        attemptService.saveAnswer(attemptId, (UUID) authentication.getPrincipal(), request);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<Void> submitAttempt(
            @PathVariable UUID attemptId,
            Authentication authentication
    ) {
        attemptService.submitAttempt(attemptId, (UUID) authentication.getPrincipal());
        return ResponseEntity.ok().build();
    }
}
