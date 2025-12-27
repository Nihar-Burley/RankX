package com.application.problemservice.controller;

import com.application.problemservice.dto.ProblemRequest;
import com.application.problemservice.dto.ProblemResponse;
import com.application.problemservice.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/problems")
public class AdminController {
    private final ProblemService problemService;

    @Autowired
    public AdminController(ProblemService problemService) {
        this.problemService = problemService;
    }

    // ------------------- Admin / Instructor APIs -------------------

    @PostMapping
    public ProblemResponse createProblem(@RequestBody ProblemRequest request) {
        return problemService.createProblem(request);
    }

    @PutMapping("/{id}")
    public ProblemResponse updateProblem(@PathVariable Long id, @RequestBody ProblemRequest request) {
        return problemService.updateProblem(id, request);
    }

    @DeleteMapping("/{id}")
    public String deactivateProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return "Problem deleted successfully";
    }

    @GetMapping("/created-by/{userId}")
    public List<ProblemResponse> getByCreatedBy(@PathVariable Long userId) {
        return problemService.getByCreatedBy(userId);
    }

}
