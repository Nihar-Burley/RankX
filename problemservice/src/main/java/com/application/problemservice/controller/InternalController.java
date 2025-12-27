package com.application.problemservice.controller;


import com.application.problemservice.dto.ProblemMetadata;
import com.application.problemservice.dto.ProblemResponse;
import com.application.problemservice.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/internal/problems")
public class InternalController {

    private final ProblemService problemService;

    @Autowired
    public InternalController(ProblemService problemService) {
        this.problemService = problemService;
    }


    // ------------------- Internal APIs -------------------

    @GetMapping("/{id}/metadata")
    public ProblemMetadata getProblemMetadata(@PathVariable Long id) {
        return problemService.getProblemMetadata(id);
    }

    @GetMapping("/active")
    public List<ProblemResponse> getActiveProblems() {
        return problemService.getActiveProblems();
    }
}
