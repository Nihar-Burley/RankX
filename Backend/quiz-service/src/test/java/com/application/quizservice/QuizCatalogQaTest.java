package com.application.quizservice;

import com.application.quizservice.dto.QuizResponse;
import com.application.quizservice.entity.Quiz;
import com.application.quizservice.entity.QuizStatus;
import com.application.quizservice.repository.QuizRepository;
import com.application.quizservice.service.QuizService;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:quizcatalogqa;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.defer-datasource-initialization=true",
        "spring.sql.init.mode=always"
})
class QuizCatalogQaTest {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizService quizService;

    @Test
    void shouldSeedProductionLikeQuizCatalog() {
        assertThat(quizRepository.count()).isGreaterThanOrEqualTo(20);
        assertThat(quizService.getPublishedQuizzes()).hasSizeGreaterThanOrEqualTo(20);
    }

    @TestFactory
    Stream<DynamicTest> everySeededQuizShouldExposeCompleteMetadata() {
        return quizRepository.findAll().stream()
                .map(quiz -> dynamicTest("quiz metadata " + quiz.getId(), () -> {
                    assertThat(quiz.getTitle()).isNotBlank();
                    assertThat(quiz.getDescription()).isNotBlank();
                    assertThat(quiz.getDurationMinutes()).isPositive();
                    assertThat(quiz.getCategory()).isNotBlank();
                    assertThat(quiz.getSubCategory()).isNotBlank();
                    assertThat(quiz.getDifficulty()).isNotNull();
                    assertThat(quiz.getStatus()).isEqualTo(QuizStatus.PUBLISHED);
                }));
    }

    @TestFactory
    Stream<DynamicTest> everySeededQuizShouldBeLoadableThroughPublicServices() {
        return quizRepository.findAll().stream()
                .map(quiz -> dynamicTest("public lookup " + quiz.getId(), () -> {
                    QuizResponse published = quizService.getPublishedQuizById(quiz.getId());
                    QuizResponse direct = quizService.getQuizById(quiz.getId());

                    assertThat(published.getId()).isEqualTo(quiz.getId());
                    assertThat(published.getTitle()).isEqualTo(quiz.getTitle());
                    assertThat(direct.getCategory()).isEqualTo(quiz.getCategory());
                    assertThat(direct.getSubCategory()).isEqualTo(quiz.getSubCategory());
                    assertThat(direct.getDifficulty()).isEqualTo(quiz.getDifficulty());
                }));
    }
}
