package com.application.userservice.config;

import com.application.userservice.client.ProblemServiceClient;
import com.application.userservice.client.QuizServiceClient;
import com.application.userservice.dto.ProblemCatalogItemView;
import com.application.userservice.dto.ProblemCatalogPageResponse;
import com.application.userservice.dto.QuizCatalogItemView;
import com.application.userservice.entity.StudyPlan;
import com.application.userservice.entity.StudyPlanItem;
import com.application.userservice.entity.StudyPlanItemType;
import com.application.userservice.repository.StudyPlanRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Configuration
@Slf4j
public class StudyPlanSeedData {

    private static final String SEED_USER_ID = "00000000-0000-0000-0000-000000000001";
    private static final String SEED_ROLE = "ROLE_USER";

    @Bean
    ApplicationRunner studyPlanSeeder(
            StudyPlanRepository studyPlanRepository,
            ProblemServiceClient problemServiceClient,
            QuizServiceClient quizServiceClient
    ) {
        return args -> {
            List<ProblemCatalogItemView> problems = fetchProblems(problemServiceClient);
            List<QuizCatalogItemView> quizzes = fetchQuizzes(quizServiceClient);

            if (problems.isEmpty() && quizzes.isEmpty()) {
                log.warn("Skipping study plan seeding because no real problem or quiz data was available");
                return;
            }

            List<StudyPlanTemplate> templates = buildTemplates(problems, quizzes);
            if (templates.isEmpty()) {
                log.warn("Skipping study plan seeding because templates could not be built from current content");
                return;
            }

            if (studyPlanRepository.count() == 0) {
                studyPlanRepository.saveAll(templates.stream().map(this::toStudyPlan).toList());
                log.info("Seeded {} study plans using live content references", templates.size());
                return;
            }

            reconcileSeededPlans(studyPlanRepository, templates);
        };
    }

    private List<ProblemCatalogItemView> fetchProblems(ProblemServiceClient problemServiceClient) {
        try {
            ProblemCatalogPageResponse page = problemServiceClient.getProblems(0, 100, "createdAt", "asc");
            if (page == null || page.getContent() == null) {
                return List.of();
            }
            return page.getContent().stream()
                    .filter(problem -> problem.getId() != null)
                    .sorted(Comparator.comparing(ProblemCatalogItemView::getId))
                    .toList();
        } catch (Exception ex) {
            log.warn("Could not fetch problem catalog for study plan seeding", ex);
            return List.of();
        }
    }

    private List<QuizCatalogItemView> fetchQuizzes(QuizServiceClient quizServiceClient) {
        try {
            List<QuizCatalogItemView> quizzes = quizServiceClient.getPublishedQuizzes(SEED_USER_ID, SEED_ROLE);
            if (quizzes == null) {
                return List.of();
            }
            return quizzes.stream()
                    .filter(quiz -> quiz.getId() != null)
                    .sorted(Comparator.comparing(QuizCatalogItemView::getTitle, Comparator.nullsLast(String::compareToIgnoreCase)))
                    .toList();
        } catch (Exception ex) {
            log.warn("Could not fetch quiz catalog for study plan seeding", ex);
            return List.of();
        }
    }

    private List<StudyPlanTemplate> buildTemplates(
            List<ProblemCatalogItemView> problems,
            List<QuizCatalogItemView> quizzes
    ) {
        Set<Long> usedProblemIds = new HashSet<>();
        Set<UUID> usedQuizIds = new HashSet<>();
        List<StudyPlanTemplate> templates = new ArrayList<>();

        ProblemCatalogItemView arraysProblem = selectProblem(problems, usedProblemIds, List.of("array", "string", "two pointer", "two-pointer"));
        QuizCatalogItemView stringsQuiz = selectQuiz(quizzes, usedQuizIds, List.of("string", "javascript", "fundamental", "html"));
        ProblemCatalogItemView twoPointerProblem = selectProblem(problems, usedProblemIds, List.of("two pointer", "two-pointer", "array"));
        addPlanIfPresent(templates, plan(
                "dsa-basics",
                "DSA Basics",
                "Core arrays, strings, and two-pointer coding warmup.",
                "Coding",
                "Beginner",
                seedProblem(1, "Arrays warmup", "Solve an introductory array problem.", arraysProblem, 20),
                seedQuiz(2, "String fundamentals quiz", "Test basic string manipulation concepts.", stringsQuiz, 15),
                seedProblem(3, "Two pointers intro", "Solve a beginner two-pointer challenge.", twoPointerProblem, 25)
        ));

        ProblemCatalogItemView javaCollectionsProblem = selectProblem(problems, usedProblemIds, List.of("java", "collection", "hash", "map"));
        QuizCatalogItemView javaOopQuiz = selectQuiz(quizzes, usedQuizIds, List.of("java", "oop", "object", "collections"));
        ProblemCatalogItemView javaStreamsProblem = selectProblem(problems, usedProblemIds, List.of("java", "stream", "loop", "iteration"));
        addPlanIfPresent(templates, plan(
                "java-problem-solving",
                "Java Problem Solving",
                "Strengthen Java syntax and implementation confidence with guided practice.",
                "Coding",
                "Intermediate",
                seedProblem(1, "Java collections challenge", "Implement a hash map based coding task.", javaCollectionsProblem, 30),
                seedQuiz(2, "OOP concept checkpoint", "Review Java OOP concepts in a quiz.", javaOopQuiz, 15),
                seedProblem(3, "Streams and loops drill", "Practice Java iteration and streams.", javaStreamsProblem, 25)
        ));

        QuizCatalogItemView htmlQuiz = selectQuiz(quizzes, usedQuizIds, List.of("html", "semantic", "frontend", "css", "javascript"));
        QuizCatalogItemView cssQuiz = selectQuiz(quizzes, usedQuizIds, List.of("css", "layout", "frontend", "grid", "flex"));
        QuizCatalogItemView jsQuiz = selectQuiz(quizzes, usedQuizIds, List.of("javascript", "js", "frontend", "browser"));
        addPlanIfPresent(templates, plan(
                "frontend-mcq-revision",
                "Frontend MCQ Revision",
                "Revise browser, HTML, CSS, and JavaScript concepts through quizzes.",
                "Quiz",
                "Beginner",
                seedQuiz(1, "HTML and semantics", "Quick MCQ revision on semantic HTML.", htmlQuiz, 15),
                seedQuiz(2, "CSS layouts", "Review flexbox and grid concepts.", cssQuiz, 15),
                seedQuiz(3, "JavaScript basics", "Strengthen core JS concept recall.", jsQuiz, 20)
        ));

        QuizCatalogItemView sqlQuiz = selectQuiz(quizzes, usedQuizIds, List.of("sql", "database", "backend"));
        QuizCatalogItemView restQuiz = selectQuiz(quizzes, usedQuizIds, List.of("rest", "http", "backend", "api"));
        QuizCatalogItemView springQuiz = selectQuiz(quizzes, usedQuizIds, List.of("spring", "backend", "java"));
        addPlanIfPresent(templates, plan(
                "sql-backend-quiz-track",
                "SQL + Backend Quiz Track",
                "Refresh backend and database concepts with interview-style quizzes.",
                "Quiz",
                "Intermediate",
                seedQuiz(1, "SQL joins and indexing", "Revise query optimization basics.", sqlQuiz, 20),
                seedQuiz(2, "REST and HTTP", "Checkpoint on backend API fundamentals.", restQuiz, 15),
                seedQuiz(3, "Spring backend concepts", "Review Spring and service design topics.", springQuiz, 20)
        ));

        ProblemCatalogItemView interviewProblem = selectProblem(problems, usedProblemIds, List.of("graph", "dp", "tree", "interview", "array"));
        QuizCatalogItemView systemQuiz = selectQuiz(quizzes, usedQuizIds, List.of("system", "design", "backend", "architecture"));
        ProblemCatalogItemView backendProblem = selectProblem(problems, usedProblemIds, List.of("database", "sql", "backend", "java"));
        addPlanIfPresent(templates, plan(
                "mixed-interview-prep",
                "Mixed Interview Prep",
                "Blend coding drills and quizzes for broad interview readiness.",
                "Both",
                "Advanced",
                seedProblem(1, "Algorithm sprint", "Solve an interview-grade coding problem.", interviewProblem, 35),
                seedQuiz(2, "System design concepts quiz", "Review architecture fundamentals in a quiz.", systemQuiz, 20),
                seedProblem(3, "Database coding challenge", "Solve a backend-flavored coding task.", backendProblem, 30)
        ));

        return templates;
    }

    private void addPlanIfPresent(List<StudyPlanTemplate> templates, StudyPlanTemplate template) {
        if (template != null && !template.items().isEmpty()) {
            templates.add(template);
        }
    }

    private ProblemCatalogItemView selectProblem(
            List<ProblemCatalogItemView> problems,
            Set<Long> usedProblemIds,
            List<String> keywords
    ) {
        return problems.stream()
                .filter(problem -> !usedProblemIds.contains(problem.getId()))
                .filter(problem -> matchesProblem(problem, keywords))
                .findFirst()
                .or(() -> problems.stream().filter(problem -> !usedProblemIds.contains(problem.getId())).findFirst())
                .or(() -> problems.stream().filter(problem -> matchesProblem(problem, keywords)).findFirst())
                .or(() -> problems.stream().findFirst())
                .map(problem -> {
                    usedProblemIds.add(problem.getId());
                    return problem;
                })
                .orElse(null);
    }

    private QuizCatalogItemView selectQuiz(
            List<QuizCatalogItemView> quizzes,
            Set<UUID> usedQuizIds,
            List<String> keywords
    ) {
        return quizzes.stream()
                .filter(quiz -> !usedQuizIds.contains(quiz.getId()))
                .filter(quiz -> matchesQuiz(quiz, keywords))
                .findFirst()
                .or(() -> quizzes.stream().filter(quiz -> !usedQuizIds.contains(quiz.getId())).findFirst())
                .or(() -> quizzes.stream().filter(quiz -> matchesQuiz(quiz, keywords)).findFirst())
                .or(() -> quizzes.stream().findFirst())
                .map(quiz -> {
                    usedQuizIds.add(quiz.getId());
                    return quiz;
                })
                .orElse(null);
    }

    private boolean matchesProblem(ProblemCatalogItemView problem, List<String> keywords) {
        String haystack = (problem.getTitle() + " " + String.join(" ", problem.getTags() == null ? List.of() : problem.getTags()))
                .toLowerCase(Locale.ROOT);
        return keywords.stream().anyMatch(haystack::contains);
    }

    private boolean matchesQuiz(QuizCatalogItemView quiz, List<String> keywords) {
        String haystack = String.join(" ",
                safeLower(quiz.getTitle()),
                safeLower(quiz.getCategory()),
                safeLower(quiz.getSubCategory()),
                safeLower(quiz.getDifficulty())
        );
        return keywords.stream().anyMatch(haystack::contains);
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    private void reconcileSeededPlans(StudyPlanRepository studyPlanRepository, List<StudyPlanTemplate> templates) {
        List<StudyPlan> existingPlans = studyPlanRepository.findAllByOrderByUpdatedAtDesc();
        boolean changed = false;

        for (StudyPlanTemplate template : templates) {
            StudyPlan existingPlan = existingPlans.stream()
                    .filter(plan -> Objects.equals(plan.getSlug(), template.slug()))
                    .findFirst()
                    .orElse(null);

            if (existingPlan == null) {
                studyPlanRepository.save(toStudyPlan(template));
                changed = true;
                continue;
            }

            existingPlan.setTitle(template.title());
            existingPlan.setDescription(template.description());
            existingPlan.setTrack(template.track());
            existingPlan.setLevel(template.level());
            existingPlan.setActive(true);

            for (StudyPlanSeedItem desiredItem : template.items()) {
                StudyPlanItem existingItem = existingPlan.getItems().stream()
                        .filter(item -> Objects.equals(item.getSequenceNumber(), desiredItem.sequenceNumber()))
                        .findFirst()
                        .orElseGet(() -> {
                            StudyPlanItem created = StudyPlanItem.builder()
                                    .studyPlan(existingPlan)
                                    .sequenceNumber(desiredItem.sequenceNumber())
                                    .build();
                            existingPlan.getItems().add(created);
                            return created;
                        });

                existingItem.setTitle(desiredItem.title());
                existingItem.setDescription(desiredItem.description());
                existingItem.setItemType(desiredItem.itemType());
                existingItem.setReferenceType(desiredItem.referenceType());
                existingItem.setReferenceId(desiredItem.referenceId());
                existingItem.setReferenceKey(desiredItem.referenceKey());
                existingItem.setEstimatedMinutes(desiredItem.estimatedMinutes());
            }
            changed = true;
        }

        if (changed) {
            studyPlanRepository.saveAll(existingPlans);
            log.info("Reconciled existing seeded study plans with live problem and quiz references");
        }
    }

    private StudyPlanTemplate plan(
            String slug,
            String title,
            String description,
            String track,
            String level,
            StudyPlanSeedItem... items
    ) {
        return new StudyPlanTemplate(
                slug,
                title,
                description,
                track,
                level,
                Arrays.stream(items)
                        .filter(Objects::nonNull)
                        .toList()
        );
    }

    private StudyPlanSeedItem seedProblem(
            int sequenceNumber,
            String title,
            String description,
            ProblemCatalogItemView problem,
            int estimatedMinutes
    ) {
        if (problem == null || problem.getId() == null) {
            return null;
        }
        return new StudyPlanSeedItem(
                sequenceNumber,
                title,
                description,
                StudyPlanItemType.CODING_PROBLEM,
                "problem",
                String.valueOf(problem.getId()),
                "problem-" + problem.getId(),
                estimatedMinutes
        );
    }

    private StudyPlanSeedItem seedQuiz(
            int sequenceNumber,
            String title,
            String description,
            QuizCatalogItemView quiz,
            int estimatedMinutes
    ) {
        if (quiz == null || quiz.getId() == null) {
            return null;
        }
        return new StudyPlanSeedItem(
                sequenceNumber,
                title,
                description,
                StudyPlanItemType.QUIZ,
                "quiz",
                quiz.getId().toString(),
                "quiz-" + quiz.getId(),
                estimatedMinutes
        );
    }

    private StudyPlan toStudyPlan(StudyPlanTemplate template) {
        StudyPlan studyPlan = StudyPlan.builder()
                .slug(template.slug())
                .title(template.title())
                .description(template.description())
                .track(template.track())
                .level(template.level())
                .active(true)
                .build();

        for (StudyPlanSeedItem item : template.items()) {
            StudyPlanItem entity = StudyPlanItem.builder()
                    .studyPlan(studyPlan)
                    .sequenceNumber(item.sequenceNumber())
                    .title(item.title())
                    .description(item.description())
                    .itemType(item.itemType())
                    .referenceType(item.referenceType())
                    .referenceId(item.referenceId())
                    .referenceKey(item.referenceKey())
                    .estimatedMinutes(item.estimatedMinutes())
                    .build();
            studyPlan.getItems().add(entity);
        }
        return studyPlan;
    }

    private record StudyPlanTemplate(
            String slug,
            String title,
            String description,
            String track,
            String level,
            List<StudyPlanSeedItem> items
    ) {
        private StudyPlanTemplate {
            items = items.stream().filter(Objects::nonNull).toList();
        }
    }

    private record StudyPlanSeedItem(
            int sequenceNumber,
            String title,
            String description,
            StudyPlanItemType itemType,
            String referenceType,
            String referenceId,
            String referenceKey,
            int estimatedMinutes
    ) {
    }
}
