package com.application.userservice.repository;

import com.application.userservice.entity.StudyPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {

    @EntityGraph(attributePaths = "items")
    List<StudyPlan> findByActiveTrueOrderByTitleAsc();

    @EntityGraph(attributePaths = "items")
    Optional<StudyPlan> findByIdAndActiveTrue(Long id);

    @EntityGraph(attributePaths = "items")
    List<StudyPlan> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = "items")
    Optional<StudyPlan> findBySlugIgnoreCase(String slug);

    @EntityGraph(attributePaths = "items")
    Optional<StudyPlan> findStudyPlanById(Long id);
}
