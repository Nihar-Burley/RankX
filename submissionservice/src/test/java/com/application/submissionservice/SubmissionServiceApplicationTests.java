package com.application.submissionservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import com.application.submissionservice.client.ProblemServiceClient;
import com.application.submissionservice.judge.Judge0Client;

@SpringBootTest(properties = {
		"spring.cloud.config.enabled=false",
		"spring.cloud.discovery.enabled=false",
		"eureka.client.enabled=false",
		"problem.service.url=localhost:8080",
		"spring.datasource.url=jdbc:h2:mem:submissionservice;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
		"spring.datasource.driverClassName=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
class SubmissionServiceApplicationTests {

	@MockBean
	private ProblemServiceClient problemServiceClient;

	@MockBean
	private Judge0Client judge0Client;

	@Test
	void contextLoads() {
	}

}
