package com.application.resultservice.controller;

import com.application.resultservice.dto.ResultResponse;
import com.application.resultservice.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/evaluate/{attemptId}")
    public ResponseEntity<ResultResponse> evaluate(
            @PathVariable UUID attemptId,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resultService.evaluateAttempt(attemptId, userId));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/{attemptId}")
    public ResponseEntity<ResultResponse> getResult(
            @PathVariable UUID attemptId,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(resultService.getResultByAttempt(attemptId, userId));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/me")
    public ResponseEntity<List<ResultResponse>> getMyResults(
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(resultService.getResultsByUser(userId));
    }
}
