package com.application.problemservice;

import com.application.problemservice.dto.ProblemResponse;
import com.application.problemservice.dto.SampleTestCaseResponse;
import com.application.problemservice.repository.ProblemRepository;
import com.application.problemservice.service.ProblemService;
import com.application.problemservice.service.TestCaseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.cloud.config.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:problemseed;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.defer-datasource-initialization=true",
        "spring.sql.init.mode=always"
})
class ProblemSeedDataIntegrationTest {

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private ProblemService problemService;

    @Autowired
    private TestCaseService testCaseService;

    @Test
    void shouldPopulateSeedProblemsWithLanguagesTemplatesAndSamples() {
        assertThat(problemRepository.count()).isGreaterThanOrEqualTo(30);

        ProblemResponse problem = problemService.getProblemById(101L);

        assertThat(problem.getTitle()).isEqualTo("Two Sum");
        assertThat(problem.getLanguages()).extracting("languageKey")
                .containsExactlyInAnyOrder("java17", "python3", "javascript");
        assertThat(problem.getTemplates()).extracting("languageKey")
                .containsExactlyInAnyOrder("java17", "python3", "javascript");
        assertThat(problem.getConstraints()).contains("nums.length");

        List<SampleTestCaseResponse> samples = testCaseService.getSampleTestCases(101L);
        assertThat(samples).hasSize(2);
        assertThat(samples.getFirst().getExpectedOutput()).isNotBlank();
        assertThat(problemService.getProblemById(130L).getTitle()).isEqualTo("Jump Game");
    }
}
