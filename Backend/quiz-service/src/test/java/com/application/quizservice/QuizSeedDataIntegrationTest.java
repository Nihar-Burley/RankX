package com.application.quizservice;

import com.application.quizservice.dto.QuizResponse;
import com.application.quizservice.service.QuizService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:quizseed;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.defer-datasource-initialization=true",
        "spring.sql.init.mode=always"
})
class QuizSeedDataIntegrationTest {

    @Autowired
    private QuizService quizService;

    @Test
    void shouldPopulatePublishedQuizzes() {
        List<QuizResponse> quizzes = quizService.getPublishedQuizzes();

        assertThat(quizzes).hasSizeGreaterThanOrEqualTo(20);
        assertThat(quizzes).extracting(QuizResponse::getTitle)
                .contains(
                        "HTML Semantics Essentials",
                        "SQL Joins and Indexing",
                        "React State and Hooks",
                        "Algorithmic Pattern Recognition",
                        "Frontend Performance and Accessibility",
                        "Microservices Observability"
                );

        QuizResponse quiz = quizService.getQuizById(UUID.fromString("55555555-5555-5555-5555-555555555555"));
        assertThat(quiz.getCategory()).isEqualTo("Java");
        assertThat(quiz.getSubCategory()).isEqualTo("OOP");
    }
}
