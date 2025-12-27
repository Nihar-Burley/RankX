package com.application.problemservice.repository;

import com.application.problemservice.entity.ProblemTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemTemplateRepository
        extends JpaRepository<ProblemTemplate, Long> {

    List<ProblemTemplate> findByProblemId(Long problemId);
}
