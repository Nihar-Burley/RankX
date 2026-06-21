package com.application.userservice.client;

import com.application.userservice.dto.QuizCatalogItemView;
import com.application.userservice.dto.QuizMetadataView;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "quiz-service")
public interface QuizServiceClient {

    @GetMapping("/api/quizzes")
    List<QuizCatalogItemView> getPublishedQuizzes(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Role") String role
    );

    @GetMapping("/api/quizzes/{quizId}")
    QuizMetadataView getQuizById(
            @PathVariable UUID quizId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Role") String role
    );

    @GetMapping("/api/quizzes/admin/{quizId}")
    QuizMetadataView getAdminQuizById(
            @PathVariable UUID quizId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Role") String role
    );
}
