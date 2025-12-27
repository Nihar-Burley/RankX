package com.application.problemservice.repository;

import com.application.problemservice.entity.ProblemLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemLanguageRepository
        extends JpaRepository<ProblemLanguage, Long> {

    List<ProblemLanguage> findByProblemIdAndActiveTrue(Long problemId);
}

