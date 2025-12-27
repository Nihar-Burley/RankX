package com.application.problemservice.repository;

import com.application.problemservice.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    // Public API: only sample (isSample = true) & active
    List<TestCase> findByProblemIdAndIsSampleTrueAndActiveTrue(Long problemId);

    // Internal API (Judge): all active test cases
    List<TestCase> findByProblemIdAndActiveTrue(Long problemId);

    // Admin: fetch all test cases by problem
    List<TestCase> findByProblemId(Long problemId);
}
