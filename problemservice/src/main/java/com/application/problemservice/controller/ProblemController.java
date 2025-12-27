    package com.application.problemservice.controller;

    import com.application.problemservice.dto.PagedResponse;
    import com.application.problemservice.dto.ProblemMetadata;
    import com.application.problemservice.dto.ProblemRequest;
    import com.application.problemservice.dto.ProblemResponse;
    import com.application.problemservice.service.ProblemService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/problems")
    public class ProblemController {

        private final ProblemService problemService;

        @Autowired
        public ProblemController(ProblemService problemService) {
            this.problemService = problemService;
        }

        // ------------------- Public APIs -------------------

        @GetMapping
        public PagedResponse<ProblemResponse> getAllProblems(
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size,
                @RequestParam(defaultValue = "createdAt") String sortBy,
                @RequestParam(defaultValue = "desc") String sortDir,
                @RequestParam(required = false) String difficulty,
                @RequestParam(required = false) String tag,
                @RequestParam(required = false) String search
        ) {
            return problemService.getAllProblems(page, size, sortBy, sortDir, difficulty, tag, search);
        }

        @GetMapping("/{id}")
        public ProblemResponse getProblemById(@PathVariable Long id) {
            return problemService.getProblemById(id);
        }

        @GetMapping("/difficulty/{level}")
        public List<ProblemResponse> getByDifficulty(@PathVariable String level) {
            return problemService.getByDifficulty(level);
        }

        @GetMapping("/tags/{tag}")
        public List<ProblemResponse> getByTag(@PathVariable String tag) {
            return problemService.getByTag(tag);
        }

    }
