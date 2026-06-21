package com.application.submissionservice.service;

import com.application.submissionservice.client.ProblemServiceClient;
import com.application.submissionservice.client.UserProgressClient;
import com.application.submissionservice.dto.*;
import com.application.submissionservice.entity.*;
import com.application.submissionservice.judge.Judge0Client;
import com.application.submissionservice.repository.SubmissionRepository;
import com.application.submissionservice.utility.LanguageRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SubmissionService {

    private static final int STATUS_ACCEPTED = 3;

    private final SubmissionRepository repository;
    private final ProblemServiceClient problemClient;
    private final Judge0Client judge0Client;
    private final LanguageRegistry languageRegistry;
    private final UserProgressClient userProgressClient;

    public SubmissionService(
            SubmissionRepository repository,
            ProblemServiceClient problemClient,
            Judge0Client judge0Client,
            LanguageRegistry languageRegistry,
            UserProgressClient userProgressClient
    ) {
        this.repository = repository;
        this.problemClient = problemClient;
        this.judge0Client = judge0Client;
        this.languageRegistry = languageRegistry;
        this.userProgressClient = userProgressClient;
    }

    // ================= RUN =================
    public RunResponse run(RunRequest request, String customInput) {

        validateSourceCode(request.getSourceCode());

        int languageId =
                languageRegistry.getLanguageId(request.getLanguageKey());

        RunResponse response = new RunResponse();

        List<SampleTestCaseDTO> testCases;
        if (customInput != null && !customInput.isBlank()) {
            testCases = List.of(new SampleTestCaseDTO(customInput, ""));
        } else {
            testCases = problemClient.getSampleTestCases(request.getProblemId());
        }

        log.info("RUN | Testcases fetched = {}", testCases.size());

        for (SampleTestCaseDTO tc : testCases) {

            Map<String, Object> raw =
                    judge0Client.submit(request.getSourceCode(), tc.input(), languageId);

            Judge0Result result = parseJudge0Result(raw);
            String actual = extractOutput(result);

            boolean passed =
                    result.status() != null &&
                            ((Integer) result.status().get("id")) == STATUS_ACCEPTED &&
                            (customInput == null || customInput.isBlank() || tc.expectedOutput().trim().equals(actual.trim()));

            response.addResult(
                    tc.input(),
                    tc.expectedOutput(),
                    actual,
                    passed
            );
        }

        return response;
    }

    // ================= SUBMIT =================
    public SubmitResponse submit(SubmitRequest request, UUID userId) {

        validateSourceCode(request.getSourceCode());

        int languageId =
                languageRegistry.getLanguageId(request.getLanguageKey());

        Submission submission = repository.save(
                Submission.builder()
                        .userId(userId)
                        .problemId(request.getProblemId())
                        .languageKey(request.getLanguageKey())
                        .sourceCode(request.getSourceCode())
                        .status(SubmissionStatus.PENDING)
                        .build()
        );

        List<JudgeTestCaseDTO> testCases =
                problemClient.getAllTestCases(request.getProblemId());

        List<TestCaseResultDTO> results = new ArrayList<>();

        boolean allPassed = true;
        Long maxRuntime = null;
        Integer maxMemory = null;

        for (int i = 0; i < testCases.size(); i++) {

            JudgeTestCaseDTO tc = testCases.get(i);

            Map<String, Object> raw =
                    judge0Client.submit(request.getSourceCode(), tc.input(), languageId);

            Judge0Result result = parseJudge0Result(raw);
            String actual = extractOutput(result);

            boolean passed =
                    result.status() != null &&
                            ((Integer) result.status().get("id")) == STATUS_ACCEPTED &&
                            tc.expectedOutput().trim().equals(actual.trim());

            results.add(new TestCaseResultDTO(i + 1, passed));

            if (!passed) {
                allPassed = false;
            }

            // optional: track max runtime/memory
            Long timeMs = parseTime(result.time());
            if (timeMs != null) {
                maxRuntime = maxRuntime == null ? timeMs : Math.max(maxRuntime, timeMs);
            }

            if (result.memory() != null) {
                maxMemory = maxMemory == null
                        ? result.memory()
                        : Math.max(maxMemory, result.memory());
            }
        }

        submission.setStatus(
                allPassed ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER
        );
        submission.setRuntimeMs(maxRuntime == null ? null : maxRuntime.intValue());
        submission.setMemoryKb(maxMemory);
        repository.save(submission);

        if (allPassed) {
            notifyProgressUpdate(userId, request.getProblemId(), submission.getId());
        }

        return SubmitResponse.builder()
                .submissionId(submission.getId())
                .verdict(allPassed ? "ACCEPTED" : "WRONG_ANSWER")
                .results(results)
                .runtimeMs(maxRuntime)
                .memoryKb(maxMemory)
                .build();
    }

    public List<SubmissionSummaryResponse> getRecentSubmissions(UUID userId) {
        return repository.findTop5ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    public List<SubmissionSummaryResponse> getSubmissionHistory(
            UUID userId,
            String status,
            String languageKey,
            Long problemId
    ) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(submission -> matchesStatus(submission, status))
                .filter(submission -> matchesLanguage(submission, languageKey))
                .filter(submission -> matchesProblem(submission, problemId))
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    public ProblemAttemptSummaryResponse getProblemAttemptSummary(UUID userId, Long problemId) {
        List<Submission> attempts = repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(submission -> problemId.equals(submission.getProblemId()))
                .toList();

        if (attempts.isEmpty()) {
            throw new IllegalArgumentException("No attempts found for the requested problem");
        }

        long acceptedAttempts = attempts.stream()
                .filter(submission -> submission.getStatus() == SubmissionStatus.ACCEPTED)
                .count();

        Integer bestRuntime = attempts.stream()
                .map(Submission::getRuntimeMs)
                .filter(Objects::nonNull)
                .min(Comparator.naturalOrder())
                .orElse(null);

        List<String> languagesUsed = attempts.stream()
                .map(Submission::getLanguageKey)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();

        return ProblemAttemptSummaryResponse.builder()
                .problemId(problemId)
                .totalAttempts(attempts.size())
                .acceptedAttempts(acceptedAttempts)
                .latestStatus(attempts.getFirst().getStatus().name())
                .bestRuntimeMs(bestRuntime)
                .languagesUsed(languagesUsed)
                .build();
    }

    public SubmissionDetailResponse getSubmissionDetail(Long submissionId, UUID userId) {
        Submission submission = repository.findByIdAndUserId(submissionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

        return toDetailResponse(submission);
    }

    public long countSubmissions(UUID userId) {
        return repository.countByUserId(userId);
    }

    // ================= Helpers =================

    private SubmissionSummaryResponse toSummaryResponse(Submission submission) {
        return SubmissionSummaryResponse.builder()
                .id(submission.getId())
                .problemId(submission.getProblemId())
                .languageKey(submission.getLanguageKey())
                .status(submission.getStatus())
                .runtimeMs(submission.getRuntimeMs())
                .memoryKb(submission.getMemoryKb())
                .createdAt(submission.getCreatedAt())
                .build();
    }

    private SubmissionDetailResponse toDetailResponse(Submission submission) {
        return SubmissionDetailResponse.builder()
                .id(submission.getId())
                .userId(submission.getUserId())
                .problemId(submission.getProblemId())
                .languageKey(submission.getLanguageKey())
                .sourceCode(submission.getSourceCode())
                .status(submission.getStatus())
                .runtimeMs(submission.getRuntimeMs())
                .memoryKb(submission.getMemoryKb())
                .createdAt(submission.getCreatedAt())
                .build();
    }

    private void validateSourceCode(String sourceCode) {
        if (sourceCode == null || sourceCode.isBlank()) {
            throw new IllegalArgumentException("Source code is missing");
        }
    }

    private Judge0Result parseJudge0Result(Map<String, Object> raw) {
        return new Judge0Result(
                (String) raw.get("stdout"),
                (String) raw.get("stderr"),
                (String) raw.get("compile_output"),
                (String) raw.get("time"),
                (Integer) raw.get("memory"),
                (Map<String, Object>) raw.get("status")
        );
    }

    private String extractOutput(Judge0Result result) {
        if (result.stdout() != null && !result.stdout().isBlank()) {
            return result.stdout().trim();
        }
        if (result.compile_output() != null && !result.compile_output().isBlank()) {
            return result.compile_output().trim();
        }
        if (result.stderr() != null && !result.stderr().isBlank()) {
            return result.stderr().trim();
        }
        return "";
    }

    private Long parseTime(String time) {
        if (time == null) return null;
        return (long) (Double.parseDouble(time) * 1000);
    }

    private void notifyProgressUpdate(UUID userId, Long problemId, Long submissionId) {
        try {
            userProgressClient.updateActivityProgress(
                    userId.toString(),
                    "ROLE_USER",
                    ActivityProgressUpdateRequest.builder()
                            .itemType("CODING_PROBLEM")
                            .referenceKey("problem-" + problemId)
                            .sourceEventId("submission-" + submissionId)
                            .build()
            );
            log.info("Progress sync sent for accepted submission {} and user {}", submissionId, userId);
        } catch (Exception ex) {
            log.warn("Failed to sync progress for accepted submission {} and user {}", submissionId, userId, ex);
        }
    }

    private boolean matchesStatus(Submission submission, String status) {
        return status == null
                || status.isBlank()
                || submission.getStatus().name().equalsIgnoreCase(status.trim());
    }

    private boolean matchesLanguage(Submission submission, String languageKey) {
        return languageKey == null
                || languageKey.isBlank()
                || submission.getLanguageKey().equalsIgnoreCase(languageKey.trim());
    }

    private boolean matchesProblem(Submission submission, Long problemId) {
        return problemId == null || problemId.equals(submission.getProblemId());
    }
}
