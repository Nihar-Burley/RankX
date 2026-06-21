package com.application.questionservice;

import com.application.questionservice.dto.QuestionResponse;
import com.application.questionservice.repository.QuestionRepository;
import com.application.questionservice.service.QuestionService;
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
        "spring.datasource.url=jdbc:h2:mem:questionseed;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.defer-datasource-initialization=true",
        "spring.sql.init.mode=always"
})
class QuestionSeedDataIntegrationTest {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuestionRepository questionRepository;

    @Test
    void shouldPopulateQuestionsForSeededQuiz() {
        assertThat(questionRepository.count()).isGreaterThanOrEqualTo(80);

        List<QuestionResponse> questions = questionService.getQuestionsByQuiz(
                UUID.fromString("11111111-1111-1111-1111-111111111111")
        );

        assertThat(questions).hasSizeGreaterThanOrEqualTo(4);
        assertThat(questions.getFirst().getOptions()).hasSize(4);
        assertThat(questions).extracting(QuestionResponse::getQuestionText)
                .anyMatch(text -> text.contains("semantic HTML"));
        assertThat(questionService.getQuestionsByQuiz(UUID.fromString("23232323-2323-2323-2323-232323232323")))
                .hasSizeGreaterThanOrEqualTo(4);
    }
}
