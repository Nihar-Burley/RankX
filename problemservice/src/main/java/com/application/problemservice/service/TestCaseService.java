package com.application.problemservice.service;

import com.application.problemservice.dto.*;

import java.util.List;

public interface TestCaseService {

    // ---------------- ADMIN ----------------
    TestCaseResponse addTestCase(Long problemId, TestCaseRequest request);
    TestCaseResponse updateTestCase(Long testCaseId, TestCaseRequest request);
    void deactivateTestCase(Long testCaseId);

    // ---------------- PUBLIC ----------------
    List<SampleTestCaseResponse> getSampleTestCases(Long problemId);

    // ---------------- JUDGE / INTERNAL ----------------
    List<JudgeTestCaseResponse> getAllTestCasesForJudge(Long problemId);
}
