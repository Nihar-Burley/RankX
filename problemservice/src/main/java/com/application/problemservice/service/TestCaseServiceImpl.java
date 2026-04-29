package com.application.problemservice.service;

import com.application.problemservice.dto.*;
import com.application.problemservice.entity.Problem;
import com.application.problemservice.entity.TestCase;
import com.application.problemservice.repository.ProblemRepository;
import com.application.problemservice.repository.TestCaseRepository;
import com.application.problemservice.service.TestCaseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TestCaseServiceImpl implements TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;

    public TestCaseServiceImpl(
            TestCaseRepository testCaseRepository,
            ProblemRepository problemRepository
    ) {
        this.testCaseRepository = testCaseRepository;
        this.problemRepository = problemRepository;
    }

    // ---------------- ADMIN ----------------
    @Override
    public TestCaseResponse addTestCase(Long problemId, TestCaseRequest request) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        TestCase testCase = TestCase.builder()
                .problem(problem)
                .input(request.getInput())
                .expectedOutput(request.getExpectedOutput())
                .isSample(request.getIsSample())
                .score(request.getScore() != null ? request.getScore() : 1)
                .active(true)
                .build();

        TestCase saved = testCaseRepository.save(testCase);
        return mapToAdminResponse(saved);
    }

    @Override
    public TestCaseResponse updateTestCase(Long testCaseId, TestCaseRequest request) {

        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new RuntimeException("TestCase not found"));

        testCase.setInput(request.getInput());
        testCase.setExpectedOutput(request.getExpectedOutput());
        testCase.setIsSample(request.getIsSample());
        testCase.setScore(request.getScore());


        return mapToAdminResponse(testCaseRepository.save(testCase));
    }

    @Override
    public void deactivateTestCase(Long testCaseId) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new RuntimeException("TestCase not found"));

        testCase.setActive(false);
        testCaseRepository.save(testCase);
    }

    // ---------------- PUBLIC ----------------
    @Override
    public List<SampleTestCaseResponse> getSampleTestCases(Long problemId) {
        return testCaseRepository.findByProblemIdAndIsSampleTrueAndActiveTrue(problemId)
                .stream()
                .map(this::mapToSampleResponse)
                .collect(Collectors.toList());
    }

    // ---------------- JUDGE / INTERNAL ----------------
    @Override
    public List<JudgeTestCaseResponse> getAllTestCasesForJudge(Long problemId) {
        return testCaseRepository.findByProblemIdAndActiveTrue(problemId)
                .stream()
                .map(this::mapToJudgeResponse)
                .collect(Collectors.toList());
    }

    // ---------------- MAPPERS ----------------
    private TestCaseResponse mapToAdminResponse(TestCase tc) {
        return TestCaseResponse.builder()
                .id(tc.getId())
                .input(tc.getInput())
                .expectedOutput(tc.getExpectedOutput())
                .isSample(tc.getIsSample())
                .score(tc.getScore())
                .active(tc.getActive())
                .build();
    }

    private SampleTestCaseResponse mapToSampleResponse(TestCase tc) {
        return SampleTestCaseResponse.builder()
                .id(tc.getId())
                .input(tc.getInput())
                .expectedOutput(tc.getExpectedOutput()) // ✅ FIX
                .build();
    }


    private JudgeTestCaseResponse mapToJudgeResponse(TestCase tc) {
        return JudgeTestCaseResponse.builder()
                .id(tc.getId())
                .input(tc.getInput())
                .expectedOutput(tc.getExpectedOutput())
                .score(tc.getScore())

                .build();
    }
}
