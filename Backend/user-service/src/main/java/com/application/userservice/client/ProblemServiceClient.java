package com.application.userservice.client;

import com.application.userservice.dto.ProblemCatalogPageResponse;
import com.application.userservice.dto.ProblemMetadataView;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "problem-service")
public interface ProblemServiceClient {

    @GetMapping("/api/problems")
    ProblemCatalogPageResponse getProblems(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sortBy") String sortBy,
            @RequestParam("sortDir") String sortDir
    );

    @GetMapping("/api/problems/{id}")
    ProblemMetadataView getProblemById(@PathVariable Long id);
}
