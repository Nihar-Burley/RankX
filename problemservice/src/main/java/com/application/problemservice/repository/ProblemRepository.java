package com.application.problemservice.repository;

import com.application.problemservice.entity.Difficulty;
import com.application.problemservice.entity.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    boolean existsByTitle(String title);

    // ------------------- Difficulty -------------------
    List<Problem> findByDifficulty(Difficulty difficulty);             // For list API
    Page<Problem> findByDifficulty(Difficulty difficulty, Pageable pageable); // For paginated API

    // ------------------- Tags -------------------
    List<Problem> findByTagsContaining(String tag);
    Page<Problem> findByTagsContaining(String tag, Pageable pageable); // Optional pagination

    // ------------------- Created By -------------------
    List<Problem> findByCreatedBy(Long userId);

    // ------------------- Active -------------------
    List<Problem> findByActiveTrue();
    Page<Problem> findByActiveTrue(Pageable pageable); // Optional pagination

    // ------------------- Search -------------------
    Page<Problem> findByTitleContainingIgnoreCase(String search, Pageable pageable); // For search API
}
