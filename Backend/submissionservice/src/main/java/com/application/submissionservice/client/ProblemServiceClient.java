package com.application.submissionservice.client;

import com.application.submissionservice.dto.JudgeTestCaseDTO;
import com.application.submissionservice.dto.ProblemDetailDTO;
import com.application.submissionservice.dto.SampleTestCaseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "problem-service")
public interface ProblemServiceClient {

    // Sample test cases (RUN)
    @GetMapping("/api/problems/{problemId}/testcases/samples")
    List<SampleTestCaseDTO> getSampleTestCases(@PathVariable Long problemId);

    @GetMapping("/api/internal/problems/{problemId}")
    ProblemDetailDTO getProblemDetails(@PathVariable Long problemId);

    // All test cases (SUBMIT)
    @GetMapping("/api/internal/problems/{problemId}/testcases")
    List<JudgeTestCaseDTO> getAllTestCases(@PathVariable Long problemId);
}
