package com.application.questionservice;

import com.application.questionservice.dto.QuestionResponse;
import com.application.questionservice.entity.Question;
import com.application.questionservice.repository.QuestionRepository;
import com.application.questionservice.service.QuestionService;
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
        "spring.datasource.url=jdbc:h2:mem:questioncatalogqa;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.defer-datasource-initialization=true",
        "spring.sql.init.mode=always"
})
class QuestionCatalogQaTest {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionService questionService;

    @Test
    void shouldSeedProductionLikeQuestionCatalog() {
        assertThat(questionRepository.count()).isGreaterThanOrEqualTo(80);
    }

    @TestFactory
    Stream<DynamicTest> everySeededQuestionShouldExposePromptOptionsAndCorrectAnswer() {
        return questionRepository.findAll().stream()
                .map(question -> dynamicTest("question integrity " + question.getId(), () -> {
                    assertThat(question.getQuizId()).isNotNull();
                    assertThat(question.getQuestionText()).isNotBlank();
                    assertThat(question.getOptionA()).isNotBlank();
                    assertThat(question.getOptionB()).isNotBlank();
                    assertThat(question.getOptionC()).isNotBlank();
                    assertThat(question.getOptionD()).isNotBlank();
                    assertThat(question.getCorrectOption()).isIn("A", "B", "C", "D");
                }));
    }

    @TestFactory
    Stream<DynamicTest> eachQuizShouldExposeAtLeastFourPublicQuestions() {
        return questionRepository.findAll().stream()
                .map(Question::getQuizId)
                .distinct()
                .map(quizId -> dynamicTest("quiz question set " + quizId, () -> {
                    List<QuestionResponse> questions = questionService.getQuestionsByQuiz(quizId);
                    assertThat(questions).hasSizeGreaterThanOrEqualTo(4);
                    assertThat(questions).allSatisfy(question -> {
                        assertThat(question.getId()).isNotNull();
                        assertThat(question.getQuestionText()).isNotBlank();
                        assertThat(question.getOptions()).hasSize(4);
                        assertThat(question.getOptions()).allMatch(option -> option != null && !option.isBlank());
                    });
                }));
    }
}
