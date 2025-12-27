package com.application.problemservice.service;

import com.application.problemservice.dto.*;
import com.application.problemservice.entity.Difficulty;
import com.application.problemservice.entity.Problem;
import com.application.problemservice.repository.ProblemLanguageRepository;
import com.application.problemservice.repository.ProblemRepository;
import com.application.problemservice.repository.ProblemTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    @Autowired
    private ProblemLanguageRepository languageRepository;

    @Autowired
    private ProblemTemplateRepository templateRepository;


    @Autowired
    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    // ------------------- CRUD -------------------

    public ProblemResponse createProblem(ProblemRequest request) {
        Problem problem = mapToEntity(request);
        Problem saved = problemRepository.save(problem);
        return mapToResponse(saved);
    }

    public ProblemResponse getProblemById(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        return mapToResponse(problem);
    }

    public ProblemResponse updateProblem(Long id, ProblemRequest request) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        if (request.getTitle() != null) problem.setTitle(request.getTitle());
        if (request.getStatement() != null) problem.setStatement(request.getStatement());
        if (request.getDifficulty() != null)
            problem.setDifficulty(Difficulty.valueOf(String.valueOf(request.getDifficulty())));
        if (request.getTags() != null) problem.setTags(String.join(",", request.getTags()));
        if (request.getConstraints() != null) problem.setConstraints(request.getConstraints());
        if (request.getEditorial() != null) problem.setEditorial(request.getEditorial());

        Problem updated = problemRepository.save(problem);
        return mapToResponse(updated);
    }

    public void deleteProblem(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        problem.setActive(false); // soft delete
        problemRepository.save(problem);
    }

    // ------------------- Listing / Filtering -------------------

    public PagedResponse<ProblemResponse> getAllProblems(int page, int size, String sortBy, String sortDir,
                                                         String difficulty, String tag, String search) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Problem> problemPage;

        if (difficulty != null) {
            Difficulty diffEnum = Difficulty.valueOf(difficulty.toUpperCase());
            problemPage = problemRepository.findByDifficulty(diffEnum, pageable);
        } else if (tag != null) {
            problemPage = problemRepository.findByTagsContaining(tag, pageable);
        } else if (search != null) {
            problemPage = problemRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else {
            problemPage = problemRepository.findAll(pageable);
        }

        List<ProblemResponse> responses = problemPage.getContent()
                .stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PagedResponse<>(
                responses,
                problemPage.getNumber(),
                problemPage.getSize(),
                problemPage.getTotalElements(),
                problemPage.getTotalPages(),
                problemPage.isLast()
        );
    }

    public List<ProblemResponse> getByCreatedBy(Long userId) {
        return problemRepository.findByCreatedBy(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ProblemResponse> getActiveProblems() {
        return problemRepository.findByActiveTrue()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ProblemMetadata getProblemMetadata(Long id) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        ProblemMetadata metadata = new ProblemMetadata();
        metadata.setId(problem.getId());
        metadata.setTitle(problem.getTitle());
        metadata.setDifficulty(problem.getDifficulty().name());
        metadata.setTags(problem.getTags() != null
                ? problem.getTags().split(",")
                : new String[]{});
        return metadata;
    }


    // ------------------- By Difficulty -------------------
    public List<ProblemResponse> getByDifficulty(String difficulty) {
        // Convert String → Enum
        Difficulty diffEnum;
        try {
            diffEnum = Difficulty.valueOf(difficulty.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid difficulty level: " + difficulty);
        }

        List<Problem> problems = problemRepository.findByDifficulty(diffEnum);
        return problems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ------------------- By Tag -------------------
    public List<ProblemResponse> getByTag(String tag) {
        List<Problem> problems = problemRepository.findByTagsContaining(tag);
        return problems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ------------------- Mapping Helpers -------------------

    private Problem mapToEntity(ProblemRequest request) {
        Problem problem = new Problem();
        problem.setTitle(request.getTitle());
        problem.setStatement(request.getStatement());
        if (request.getDifficulty() != null) {
            problem.setDifficulty(Difficulty.valueOf(String.valueOf(request.getDifficulty())));
        }
        if (request.getTags() != null) {
            problem.setTags(String.join(",", request.getTags()));
        }
        problem.setConstraints(request.getConstraints());
        problem.setEditorial(request.getEditorial());
        problem.setCreatedBy(request.getCreatedBy());
        problem.setActive(true);
        return problem;
    }

    private ProblemResponse mapToResponse(Problem problem) {

        ProblemResponse response = new ProblemResponse();

        response.setId(problem.getId());
        response.setTitle(problem.getTitle());
        response.setStatement(problem.getStatement());
        response.setDifficulty(problem.getDifficulty());

        response.setTags(problem.getTags() != null
                ? Arrays.asList(problem.getTags().split(","))
                : List.of());

        response.setConstraints(problem.getConstraints());

        // ✅ Languages
        response.setLanguages(
                languageRepository
                        .findByProblemIdAndActiveTrue(problem.getId())
                        .stream()
                        .map(lang -> ProblemLanguageResponse.builder()
                                .languageKey(lang.getLanguageKey())
                                .displayName(lang.getDisplayName())
                                .editorMode(lang.getEditorMode())
                                .build())
                        .collect(Collectors.toList())
        );

        // ✅ Templates
        response.setTemplates(
                templateRepository
                        .findByProblemId(problem.getId())
                        .stream()
                        .map(t -> ProblemTemplateResponse.builder()
                                .languageKey(t.getLanguageKey())
                                .starterCode(t.getStarterCode())
                                .build())
                        .collect(Collectors.toList())
        );

        response.setCreatedAt(problem.getCreatedAt());
        response.setUpdatedAt(problem.getUpdatedAt());

        return response;
    }

}
