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
import java.util.List;
import java.util.Locale;
import java.util.Objects;
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
        List<StudyPlanTemplate> templates = new ArrayList<>();

        ProblemCatalogItemView twoSum = findProblemByTitle(problems, "Two Sum", "array", "hash");
        ProblemCatalogItemView stock = findProblemByTitle(problems, "Best Time to Buy and Sell Stock", "array", "prefix");
        ProblemCatalogItemView binarySearch = findProblemByTitle(problems, "Binary Search", "binary-search");
        ProblemCatalogItemView validAnagram = findProblemByTitle(problems, "Valid Anagram", "string", "hash");
        ProblemCatalogItemView kthLargest = findProblemByTitle(problems, "Kth Largest Element in an Array", "heap", "sorting");
        ProblemCatalogItemView coinChange = findProblemByTitle(problems, "Coin Change", "dynamic-programming");
        ProblemCatalogItemView validParentheses = findProblemByTitle(problems, "Valid Parentheses", "stack");
        ProblemCatalogItemView mergeIntervals = findProblemByTitle(problems, "Merge Intervals", "intervals", "sorting");
        ProblemCatalogItemView longestSubstring = findProblemByTitle(problems, "Longest Substring Without Repeating Characters", "sliding-window", "string");
        ProblemCatalogItemView productExceptSelf = findProblemByTitle(problems, "Product of Array Except Self", "prefix-suffix", "array");
        ProblemCatalogItemView numberOfIslands = findProblemByTitle(problems, "Number of Islands", "graph", "matrix");
        ProblemCatalogItemView longestConsecutive = findProblemByTitle(problems, "Longest Consecutive Sequence", "set", "hash");
        ProblemCatalogItemView topKFrequent = findProblemByTitle(problems, "Top K Frequent Elements", "heap", "hash");
        ProblemCatalogItemView groupAnagrams = findProblemByTitle(problems, "Group Anagrams", "hash", "string");
        ProblemCatalogItemView courseSchedule = findProblemByTitle(problems, "Course Schedule", "topological", "graph");
        ProblemCatalogItemView rottingOranges = findProblemByTitle(problems, "Rotting Oranges", "matrix", "bfs");
        ProblemCatalogItemView pacificAtlantic = findProblemByTitle(problems, "Pacific Atlantic Water Flow", "matrix", "graph");
        ProblemCatalogItemView lruCache = findProblemByTitle(problems, "Implement LRU Cache", "cache", "design");
        ProblemCatalogItemView mergeKLists = findProblemByTitle(problems, "Merge K Sorted Lists", "linked-list", "heap");
        ProblemCatalogItemView reverseLinkedList = findProblemByTitle(problems, "Reverse Linked List", "linked-list");
        ProblemCatalogItemView reorderList = findProblemByTitle(problems, "Reorder List", "linked-list");
        ProblemCatalogItemView houseRobber = findProblemByTitle(problems, "House Robber", "dynamic-programming");

        QuizCatalogItemView algorithmPatterns = findQuizByTitle(quizzes, "Algorithmic Pattern Recognition", "algorithm", "coding");
        QuizCatalogItemView javaOop = findQuizByTitle(quizzes, "Java OOP and Collections", "java", "oop");
        QuizCatalogItemView htmlQuiz = findQuizByTitle(quizzes, "HTML Semantics Essentials", "html", "frontend");
        QuizCatalogItemView cssQuiz = findQuizByTitle(quizzes, "CSS Layout Foundations", "css", "frontend");
        QuizCatalogItemView jsQuiz = findQuizByTitle(quizzes, "JavaScript Browser Basics", "javascript", "browser");
        QuizCatalogItemView reactQuiz = findQuizByTitle(quizzes, "React State and Hooks", "react", "hooks");
        QuizCatalogItemView sqlQuiz = findQuizByTitle(quizzes, "SQL Joins and Indexing", "sql", "database");
        QuizCatalogItemView springQuiz = findQuizByTitle(quizzes, "Spring Boot APIs and Persistence", "spring", "backend");
        QuizCatalogItemView securityQuiz = findQuizByTitle(quizzes, "Backend API Security", "security", "backend");
        QuizCatalogItemView systemDesign = findQuizByTitle(quizzes, "System Design Fundamentals", "system", "design");
        QuizCatalogItemView restApiQuiz = findQuizByTitle(quizzes, "REST API Design Essentials", "api", "backend");
        QuizCatalogItemView dockerQuiz = findQuizByTitle(quizzes, "Docker and Container Basics", "docker", "platform");
        QuizCatalogItemView redisQuiz = findQuizByTitle(quizzes, "Redis Caching and Session Storage", "redis", "cache");
        QuizCatalogItemView graphQuiz = findQuizByTitle(quizzes, "Graph Traversal Patterns", "graph", "coding");
        QuizCatalogItemView dpQuiz = findQuizByTitle(quizzes, "Dynamic Programming Basics", "dynamic", "coding");
        QuizCatalogItemView observabilityQuiz = findQuizByTitle(quizzes, "Microservices Observability", "observability", "platform");

        addPlanIfPresent(templates, plan(
                "dsa-basics",
                "DSA Basics",
                "Start with core interview mechanics across arrays, search, and pattern recognition.",
                "Coding",
                "Beginner",
                seedProblem(1, "Arrays warmup", "Solve an introductory array lookup problem.", twoSum, 20),
                seedQuiz(2, "Pattern checkpoint", "Recognize core algorithmic patterns before coding deeper.", algorithmPatterns, 18),
                seedProblem(3, "Profit window drill", "Practice reasoning about local minima and maxima.", stock, 20),
                seedProblem(4, "Binary search confidence", "Lock in the classic sorted-search workflow.", binarySearch, 25)
        ));

        addPlanIfPresent(templates, plan(
                "java-problem-solving",
                "Java Problem Solving",
                "Blend Java platform knowledge with high-signal coding exercises used in interviews.",
                "Coding",
                "Intermediate",
                seedProblem(1, "Anagram frequency map", "Use counting structures cleanly and efficiently.", validAnagram, 20),
                seedQuiz(2, "Java platform checkpoint", "Review OOP, collections, and API selection tradeoffs.", javaOop, 18),
                seedProblem(3, "Heap-based ranking", "Use comparator-backed collections for ranked results.", kthLargest, 30),
                seedProblem(4, "DP translation drill", "Turn a recurrence into an iterative Java solution.", coinChange, 35)
        ));

        addPlanIfPresent(templates, plan(
                "frontend-mcq-revision",
                "Frontend MCQ Revision",
                "Revise the modern frontend stack through a clean progression from markup to React state.",
                "Frontend",
                "Beginner",
                seedQuiz(1, "HTML and semantics", "Quick MCQ revision on semantic HTML.", htmlQuiz, 15),
                seedQuiz(2, "CSS layouts", "Review flexbox and grid concepts.", cssQuiz, 15),
                seedQuiz(3, "JavaScript basics", "Strengthen core JS concept recall.", jsQuiz, 20),
                seedQuiz(4, "React state and hooks", "Connect browser fundamentals to component architecture.", reactQuiz, 20)
        ));

        addPlanIfPresent(templates, plan(
                "sql-backend-quiz-track",
                "SQL + Backend Quiz Track",
                "Refresh backend and database concepts with a stronger service, persistence, and security arc.",
                "Backend",
                "Intermediate",
                seedQuiz(1, "SQL joins and indexing", "Revise query optimization basics.", sqlQuiz, 20),
                seedQuiz(2, "Spring data and APIs", "Review controller, service, JPA, and transaction design.", springQuiz, 20),
                seedQuiz(3, "Backend API security", "Cover auth, secrets, and operational safety basics.", securityQuiz, 18),
                seedQuiz(4, "System design grounding", "Tie the backend pieces together with systems thinking.", systemDesign, 22)
        ));

        addPlanIfPresent(templates, plan(
                "algorithms-pattern-ladder",
                "Algorithms Pattern Ladder",
                "Climb through sliding windows, prefix products, graph traversal, and set-based reasoning.",
                "Coding",
                "Advanced",
                seedProblem(1, "Sliding window mastery", "Practice maintaining a dynamic unique window.", longestSubstring, 30),
                seedProblem(2, "Prefix product reasoning", "Use left and right passes without division.", productExceptSelf, 30),
                seedProblem(3, "Grid traversal systems", "Apply graph traversal cleanly on matrix input.", numberOfIslands, 35),
                seedProblem(4, "Hash-set sequence scan", "Spot the optimal O(n) boundary detection pattern.", longestConsecutive, 25)
        ));

        addPlanIfPresent(templates, plan(
                "mixed-interview-prep",
                "Mixed Interview Prep",
                "Blend coding drills and architecture quizzes for broad interview readiness.",
                "Interview",
                "Advanced",
                seedProblem(1, "Stack validity check", "Move quickly from symbols to stack invariants.", validParentheses, 20),
                seedQuiz(2, "Pattern selection quiz", "Choose the best algorithm family before implementation.", algorithmPatterns, 20),
                seedProblem(3, "Intervals under pressure", "Sort first, then merge with confidence.", mergeIntervals, 30),
                seedQuiz(4, "System design concepts quiz", "Review scaling and distributed systems tradeoffs.", systemDesign, 22)
        ));

        addPlanIfPresent(templates, plan(
                "graph-and-matrix-journey",
                "Graph and Matrix Journey",
                "Move from BFS fundamentals into graph cycles, ocean reachability, and traversal confidence.",
                "Coding",
                "Intermediate",
                seedProblem(1, "Rotting oranges clock", "Use layer-by-layer BFS on a changing matrix.", rottingOranges, 25),
                seedQuiz(2, "Graph traversal refresher", "Review BFS, DFS, and visited-state tradeoffs.", graphQuiz, 18),
                seedProblem(3, "Course dependency check", "Reason about cycles before planning execution.", courseSchedule, 30),
                seedProblem(4, "Ocean reachability", "Reverse the water-flow perspective and mark reachable cells.", pacificAtlantic, 35)
        ));

        addPlanIfPresent(templates, plan(
                "linked-list-and-cache-track",
                "Linked List and Cache Track",
                "Combine classic pointer problems with foundational cache design and ranked merging.",
                "Coding",
                "Intermediate",
                seedProblem(1, "Reverse the baseline list", "Build pointer confidence with a clean iterative reverse.", reverseLinkedList, 20),
                seedProblem(2, "Reorder linked flow", "Split, reverse, and weave a list back together.", reorderList, 30),
                seedProblem(3, "Design an LRU cache", "Model O(1) lookup plus recency ordering.", lruCache, 35),
                seedProblem(4, "Merge many sorted lists", "Use a heap to keep the next smallest node visible.", mergeKLists, 35)
        ));

        addPlanIfPresent(templates, plan(
                "backend-ops-foundations",
                "Backend Ops Foundations",
                "Strengthen API, container, cache, and observability instincts for production-facing services.",
                "Backend",
                "Intermediate",
                seedQuiz(1, "REST API shape", "Choose better resource, status, and validation patterns.", restApiQuiz, 18),
                seedQuiz(2, "Docker runtime thinking", "Understand image layering and runtime config separation.", dockerQuiz, 16),
                seedQuiz(3, "Redis and sessions", "Use cache and session primitives with better operational judgment.", redisQuiz, 16),
                seedQuiz(4, "Observability signals", "Read health, metrics, logs, and traces as one operating loop.", observabilityQuiz, 18)
        ));

        addPlanIfPresent(templates, plan(
                "algorithmic-interview-sprint",
                "Algorithmic Interview Sprint",
                "Run a sharper interview lap through grouping, frequency, DP, and greedy reachability.",
                "Interview",
                "Advanced",
                seedProblem(1, "Group related strings", "Recognize signature-based grouping quickly.", groupAnagrams, 25),
                seedProblem(2, "Top frequent extraction", "Move from counts to ranked results efficiently.", topKFrequent, 25),
                seedQuiz(3, "Dynamic programming basics", "Check whether states and transitions feel obvious yet.", dpQuiz, 18),
                seedProblem(4, "House and jump decisions", "Switch between DP and greedy reasoning under pressure.", houseRobber, 25)
        ));

        return templates;
    }

    private void addPlanIfPresent(List<StudyPlanTemplate> templates, StudyPlanTemplate template) {
        if (template != null && !template.items().isEmpty()) {
            templates.add(template);
        }
    }

    private ProblemCatalogItemView findProblemByTitle(
            List<ProblemCatalogItemView> problems,
            String title,
            String... fallbackKeywords
    ) {
        return problems.stream()
                .filter(problem -> problem.getTitle() != null && problem.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .or(() -> problems.stream().filter(problem -> matchesProblem(problem, List.of(fallbackKeywords))).findFirst())
                .orElse(null);
    }

    private QuizCatalogItemView findQuizByTitle(
            List<QuizCatalogItemView> quizzes,
            String title,
            String... fallbackKeywords
    ) {
        return quizzes.stream()
                .filter(quiz -> quiz.getTitle() != null && quiz.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .or(() -> quizzes.stream().filter(quiz -> matchesQuiz(quiz, List.of(fallbackKeywords))).findFirst())
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
