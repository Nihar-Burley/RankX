package com.application.problemservice.controller;


import com.application.problemservice.dto.*;
import com.application.problemservice.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    /* =====================================================
       ADMIN APIs (Create / Update / Delete Test Cases)
       ===================================================== */

    @PostMapping("/admin/problems/{problemId}/testcases")
    public TestCaseResponse addTestCase(
            @PathVariable Long problemId,
            @Valid @RequestBody TestCaseRequest request) {
        return testCaseService.addTestCase(problemId, request);
    }

    @PutMapping("/admin/testcases/{testCaseId}")
    public TestCaseResponse updateTestCase(
            @PathVariable Long testCaseId,
            @Valid @RequestBody TestCaseRequest request) {
        return testCaseService.updateTestCase(testCaseId, request);
    }

    @DeleteMapping("/admin/testcases/{testCaseId}")
    public void deactivateTestCase(@PathVariable Long testCaseId) {
        testCaseService.deactivateTestCase(testCaseId);
    }

    /* =====================================================
       PUBLIC APIs (Sample Test Cases Only)
       ===================================================== */

    @GetMapping("/problems/{problemId}/testcases/samples")
    public List<SampleTestCaseResponse> getSampleTestCases(
            @PathVariable Long problemId) {
        return testCaseService.getSampleTestCases(problemId);
    }

    /* =====================================================
       INTERNAL APIs (Judge Service)
       ===================================================== */

    @GetMapping("/internal/problems/{problemId}/testcases")
    public List<JudgeTestCaseResponse> getAllTestCasesForJudge(
            @PathVariable Long problemId) {
        return testCaseService.getAllTestCasesForJudge(problemId);
    }
}
