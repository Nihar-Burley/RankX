package com.application.userservice.service;

import com.application.userservice.client.ProblemServiceClient;
import com.application.userservice.client.QuizServiceClient;
import com.application.userservice.client.ResultServiceClient;
import com.application.userservice.client.SubmissionServiceClient;
import com.application.userservice.dto.ActivityAnalyticsResponse;
import com.application.userservice.dto.CodingAnalyticsResponse;
import com.application.userservice.dto.ProblemMetadataView;
import com.application.userservice.dto.ProgressSummaryResponse;
import com.application.userservice.dto.QuizAnalyticsResponse;
import com.application.userservice.dto.QuizMetadataView;
import com.application.userservice.dto.RecommendationCardResponse;
import com.application.userservice.dto.ResultAnalyticsView;
import com.application.userservice.dto.SubmissionAnalyticsView;
import com.application.userservice.dto.TopicInsightResponse;
import com.application.userservice.dto.UserAnalyticsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserAnalyticsService {

    private final SubmissionServiceClient submissionServiceClient;
    private final ResultServiceClient resultServiceClient;
    private final ProblemServiceClient problemServiceClient;
    private final QuizServiceClient quizServiceClient;
    private final UserPreferenceService userPreferenceService;
    private final StudyPlanService studyPlanService;

    public UserAnalyticsResponse getAnalytics(UUID userId, String role) {
        List<SubmissionAnalyticsView> submissions = getSubmissions(userId);
        List<ResultAnalyticsView> results = getResults(userId, role);

        CodingAnalyticsResponse coding = buildCodingAnalytics(submissions);
        QuizAnalyticsResponse quiz = buildQuizAnalytics(results, userId, role);
        ActivityAnalyticsResponse activity = buildActivityAnalytics(submissions, results, userId);
        List<RecommendationCardResponse> recommendations = buildRecommendations(userId, role, coding, quiz, activity);

        return UserAnalyticsResponse.builder()
                .codingPerformance(coding)
                .quizPerformance(quiz)
                .activitySummary(activity)
                .primaryRecommendation(recommendations.isEmpty() ? null : recommendations.getFirst())
                .recommendations(recommendations)
                .build();
    }

    public List<RecommendationCardResponse> getDashboardRecommendations(UUID userId, String role) {
        UserAnalyticsResponse analytics = getAnalytics(userId, role);
        return analytics.getRecommendations();
    }

    private List<SubmissionAnalyticsView> getSubmissions(UUID userId) {
        try {
            return submissionServiceClient.getSubmissionHistory(userId.toString());
        } catch (Exception ex) {
            log.warn("Failed to fetch submission analytics for user {}", userId, ex);
            return List.of();
        }
    }

    private List<ResultAnalyticsView> getResults(UUID userId, String role) {
        try {
            return resultServiceClient.getResults(userId.toString(), "ROLE_USER");
        } catch (Exception ex) {
            log.warn("Failed to fetch quiz analytics for user {}", userId, ex);
            return List.of();
        }
    }

    private CodingAnalyticsResponse buildCodingAnalytics(List<SubmissionAnalyticsView> submissions) {
        long accepted = submissions.stream()
                .filter(submission -> "ACCEPTED".equalsIgnoreCase(submission.getStatus()))
                .count();

        Double avgRuntime = submissions.stream()
                .map(SubmissionAnalyticsView::getRuntimeMs)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(Double.NaN);

        Double avgMemory = submissions.stream()
                .map(SubmissionAnalyticsView::getMemoryKb)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(Double.NaN);

        List<TopicInsightResponse> topics = buildCodingTopics(submissions);

        return CodingAnalyticsResponse.builder()
                .totalSubmissions(submissions.size())
                .acceptedSubmissions(accepted)
                .acceptanceRate(submissions.isEmpty() ? 0.0 : round((accepted * 100.0) / submissions.size()))
                .averageRuntimeMs(Double.isNaN(avgRuntime) ? null : round(avgRuntime))
                .averageMemoryKb(Double.isNaN(avgMemory) ? null : round(avgMemory))
                .weakTopics(selectTopics(topics, "WEAK"))
                .strongTopics(selectTopics(topics, "STRONG"))
                .build();
    }

    private QuizAnalyticsResponse buildQuizAnalytics(List<ResultAnalyticsView> results, UUID userId, String role) {
        double avgPercentage = results.stream()
                .map(ResultAnalyticsView::getPercentage)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        double bestPercentage = results.stream()
                .map(ResultAnalyticsView::getPercentage)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);

        List<TopicInsightResponse> topics = buildQuizTopics(results, userId, role);

        return QuizAnalyticsResponse.builder()
                .totalAttempts(results.size())
                .averagePercentage(round(avgPercentage))
                .bestPercentage(round(bestPercentage))
                .weakTopics(selectTopics(topics, "WEAK"))
                .strongTopics(selectTopics(topics, "STRONG"))
                .build();
    }

    private ActivityAnalyticsResponse buildActivityAnalytics(
            List<SubmissionAnalyticsView> submissions,
            List<ResultAnalyticsView> results,
            UUID userId
    ) {
        ProgressSummaryResponse progressSummary = studyPlanService.getProgressSummary(userId);
        long totalCompletedPlanItems = studyPlanService.countCompletedItems(userId);
        LocalDateTime latestCoding = submissions.stream()
                .map(SubmissionAnalyticsView::getCreatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        LocalDateTime latestQuiz = results.stream()
                .map(ResultAnalyticsView::getEvaluatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        LocalDateTime latestOverall = Stream.of(latestCoding, latestQuiz)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        return ActivityAnalyticsResponse.builder()
                .totalCodingActivities(submissions.size())
                .totalQuizActivities(results.size())
                .enrolledStudyPlans(progressSummary.getEnrolledPlans())
                .totalCompletedPlanItems(totalCompletedPlanItems)
                .streakCount(progressSummary.getStreakCount())
                .latestCodingActivityAt(latestCoding)
                .latestQuizActivityAt(latestQuiz)
                .latestOverallActivityAt(latestOverall)
                .build();
    }

    private List<RecommendationCardResponse> buildRecommendations(
            UUID userId,
            String role,
            CodingAnalyticsResponse coding,
            QuizAnalyticsResponse quiz,
            ActivityAnalyticsResponse activity
    ) {
        var preferences = userPreferenceService.getPreferences(userId);
        ProgressSummaryResponse progressSummary = studyPlanService.getProgressSummary(userId);
        StudyPlanService.StudyPlanNextItemView nextPlanItem = studyPlanService.getCurrentNextItem(userId);
        List<RecommendationCardResponse> recommendations = new ArrayList<>();

        if (!preferences.isOnboardingCompleted()) {
            recommendations.add(recommendation(
                    "Complete onboarding",
                    "Tell RankX about your goal and preferred track so your dashboard can personalize what comes next.",
                    "/onboarding",
                    "Preferences are not set yet",
                    "HIGH",
                    "ONBOARDING"
            ));
        }

        if (nextPlanItem != null) {
            recommendations.add(recommendation(
                    "Continue " + nextPlanItem.studyPlanTitle(),
                    "Your next best step is " + nextPlanItem.itemTitle() + ". Finishing it keeps your guided path moving forward.",
                    "/my-progress",
                    "Unfinished study plan item is available right now",
                    "HIGH",
                    "STUDY_PLAN_NEXT_ITEM"
            ));
        } else if (activity.getEnrolledStudyPlans() == 0) {
            recommendations.add(recommendation(
                    "Join a study plan",
                    "Structured plans unlock guided practice and clearer daily progress.",
                    "/study-plans",
                    "No active plan yet",
                    "HIGH",
                    "STUDY_PLAN_ENROLL"
            ));
        }

        RecommendationCardResponse inactivityRecommendation = buildInactivityRecommendation(activity);
        if (inactivityRecommendation != null) {
            recommendations.add(inactivityRecommendation);
        }

        RecommendationCardResponse repeatedFailureRecommendation = buildRepeatedFailureRecommendation(preferences, coding, quiz);
        if (repeatedFailureRecommendation != null) {
            recommendations.add(repeatedFailureRecommendation);
        }

        RecommendationCardResponse difficultyRecommendation = buildDifficultyRecommendation(preferences, coding, quiz, progressSummary, nextPlanItem);
        if (difficultyRecommendation != null) {
            recommendations.add(difficultyRecommendation);
        }

        if (recommendations.isEmpty()) {
            recommendations.add(recommendation(
                    "Start your next learning session",
                    "You have a clean slate. Choose one focused activity and build momentum from there.",
                    "/home",
                    "No preferences or activity yet",
                    "LOW",
                    "DEFAULT_FALLBACK"
            ));
        }

        return recommendations.stream()
                .filter(Objects::nonNull)
                .distinct()
                .limit(3)
                .toList();
    }

    private List<TopicInsightResponse> buildCodingTopics(List<SubmissionAnalyticsView> submissions) {
        Map<String, TopicAccumulator> topicMap = new LinkedHashMap<>();

        for (SubmissionAnalyticsView submission : submissions) {
            ProblemMetadataView metadata = fetchProblemMetadata(submission.getProblemId());
            String topic = resolveCodingTopic(metadata);
            TopicAccumulator accumulator = topicMap.computeIfAbsent(topic, ignored -> new TopicAccumulator("Coding"));
            accumulator.attempts++;
            if ("ACCEPTED".equalsIgnoreCase(submission.getStatus())) {
                accumulator.successes++;
            }
        }

        return toTopicInsights(topicMap);
    }

    private List<TopicInsightResponse> buildQuizTopics(List<ResultAnalyticsView> results, UUID userId, String role) {
        Map<String, TopicAccumulator> topicMap = new LinkedHashMap<>();

        for (ResultAnalyticsView result : results) {
            QuizMetadataView metadata = fetchQuizMetadata(result.getQuizId(), userId, role);
            String topic = resolveQuizTopic(metadata);
            TopicAccumulator accumulator = topicMap.computeIfAbsent(topic, ignored -> new TopicAccumulator("Quiz"));
            accumulator.attempts++;
            if (result.getPercentage() != null && result.getPercentage() >= 60.0) {
                accumulator.successes++;
            }
        }

        return toTopicInsights(topicMap);
    }

    private List<TopicInsightResponse> toTopicInsights(Map<String, TopicAccumulator> topicMap) {
        return topicMap.entrySet().stream()
                .map(entry -> {
                    TopicAccumulator accumulator = entry.getValue();
                    double successRate = accumulator.attempts == 0
                            ? 0.0
                            : round((accumulator.successes * 100.0) / accumulator.attempts);
                    return TopicInsightResponse.builder()
                            .topic(entry.getKey())
                            .track(accumulator.track)
                            .attempts(accumulator.attempts)
                            .successRate(successRate)
                            .classification(classifyTopic(accumulator.attempts, successRate))
                            .build();
                })
                .sorted(Comparator.comparing(TopicInsightResponse::getSuccessRate))
                .toList();
    }

    private List<TopicInsightResponse> selectTopics(List<TopicInsightResponse> topics, String classification) {
        return topics.stream()
                .filter(topic -> classification.equalsIgnoreCase(topic.getClassification()))
                .limit(3)
                .toList();
    }

    private ProblemMetadataView fetchProblemMetadata(Long problemId) {
        try {
            return problemServiceClient.getProblemById(problemId);
        } catch (Exception ex) {
            log.debug("Problem metadata unavailable for {}", problemId, ex);
            return null;
        }
    }

    private QuizMetadataView fetchQuizMetadata(UUID quizId, UUID userId, String role) {
        try {
            return quizServiceClient.getQuizById(quizId, userId.toString(), "ROLE_USER");
        } catch (Exception ex) {
            log.debug("Quiz metadata unavailable for {}", quizId, ex);
            return null;
        }
    }

    private String resolveCodingTopic(ProblemMetadataView metadata) {
        if (metadata != null && metadata.getTags() != null && !metadata.getTags().isEmpty()) {
            return metadata.getTags().getFirst();
        }
        return "Coding Fundamentals";
    }

    private String resolveQuizTopic(QuizMetadataView metadata) {
        if (metadata == null) {
            return "Quiz Practice";
        }
        if (metadata.getSubCategory() != null && !metadata.getSubCategory().isBlank()) {
            return metadata.getSubCategory();
        }
        if (metadata.getCategory() != null && !metadata.getCategory().isBlank()) {
            return metadata.getCategory();
        }
        return "Quiz Practice";
    }

    private String classifyTopic(long attempts, double successRate) {
        if (attempts == 0) {
            return "NEUTRAL";
        }
        if (attempts >= 2 && successRate >= 75.0) {
            return "STRONG";
        }
        if (successRate < 60.0) {
            return "WEAK";
        }
        return "NEUTRAL";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private RecommendationCardResponse buildInactivityRecommendation(ActivityAnalyticsResponse activity) {
        if (activity.getLatestOverallActivityAt() == null) {
            return null;
        }

        long inactiveDays = ChronoUnit.DAYS.between(activity.getLatestOverallActivityAt(), LocalDateTime.now());
        if (inactiveDays < 3) {
            return null;
        }

        return recommendation(
                inactiveDays >= 7 ? "Restart your streak" : "Get back into practice",
                inactiveDays >= 7
                        ? "It has been " + inactiveDays + " days since your last session. A quick focused round will restart momentum."
                        : "You have been away for " + inactiveDays + " days. A short practice session will keep your learning warm.",
                "/home",
                "Inactivity detected across coding and quiz activity",
                "HIGH",
                "INACTIVITY"
        );
    }

    private RecommendationCardResponse buildRepeatedFailureRecommendation(
            com.application.userservice.dto.UserPreferenceResponse preferences,
            CodingAnalyticsResponse coding,
            QuizAnalyticsResponse quiz
    ) {
        TopicInsightResponse weakCodingTopic = coding.getWeakTopics().stream()
                .filter(topic -> topic.getAttempts() >= 2)
                .findFirst()
                .orElse(null);
        TopicInsightResponse weakQuizTopic = quiz.getWeakTopics().stream()
                .filter(topic -> topic.getAttempts() >= 2)
                .findFirst()
                .orElse(null);

        boolean codingPreferred = "Coding".equalsIgnoreCase(preferences.getPreferredTrack())
                || "Both".equalsIgnoreCase(preferences.getPreferredTrack());
        boolean quizPreferred = "Quiz".equalsIgnoreCase(preferences.getPreferredTrack())
                || "Both".equalsIgnoreCase(preferences.getPreferredTrack());

        if (codingPreferred && weakCodingTopic != null) {
            return recommendation(
                    "Strengthen " + weakCodingTopic.getTopic(),
                    "You have struggled on this coding topic multiple times. Revisit it with one simpler problem before moving on.",
                    "/submissions",
                    "Repeated low acceptance in " + weakCodingTopic.getTopic(),
                    "MEDIUM",
                    "REPEATED_TOPIC_FAILURE"
            );
        }

        if (quizPreferred && weakQuizTopic != null) {
            return recommendation(
                    "Review " + weakQuizTopic.getTopic(),
                    "This quiz topic is still costing points. A focused revision attempt can close the gap quickly.",
                    "/quiz/history",
                    "Repeated low quiz performance in " + weakQuizTopic.getTopic(),
                    "MEDIUM",
                    "REPEATED_TOPIC_FAILURE"
            );
        }

        return null;
    }

    private RecommendationCardResponse buildDifficultyRecommendation(
            com.application.userservice.dto.UserPreferenceResponse preferences,
            CodingAnalyticsResponse coding,
            QuizAnalyticsResponse quiz,
            ProgressSummaryResponse progressSummary,
            StudyPlanService.StudyPlanNextItemView nextPlanItem
    ) {
        String targetLevel = determineNextDifficulty(preferences.getSkillLevel(), coding.getAcceptanceRate(), quiz.getAveragePercentage());

        if (nextPlanItem != null && nextPlanItem.level() != null && nextPlanItem.level().equalsIgnoreCase(targetLevel)) {
            return recommendation(
                    "Step into " + targetLevel + " practice",
                    "Your next plan item already matches the next useful difficulty step for your current performance.",
                    "/my-progress",
                    "Difficulty progression aligns with your active plan",
                    "MEDIUM",
                    "DIFFICULTY_PROGRESSION"
            );
        }

        if (progressSummary.getCurrentPlan() != null) {
            return recommendation(
                    "Progress into " + targetLevel + " work",
                    "Your recent performance suggests you are ready for " + targetLevel.toLowerCase() + " level practice next.",
                    "/study-plans",
                    "Difficulty progression based on recent performance",
                    "LOW",
                    "DIFFICULTY_PROGRESSION"
            );
        }

        return null;
    }

    private String determineNextDifficulty(String skillLevel, double codingAcceptanceRate, double quizAveragePercentage) {
        double blendedScore = Math.max(codingAcceptanceRate, quizAveragePercentage);
        if ("Beginner".equalsIgnoreCase(skillLevel) && blendedScore >= 70.0) {
            return "Intermediate";
        }
        if ("Intermediate".equalsIgnoreCase(skillLevel) && blendedScore >= 78.0) {
            return "Advanced";
        }
        return skillLevel == null || skillLevel.isBlank() ? "Beginner" : skillLevel;
    }

    private RecommendationCardResponse recommendation(
            String title,
            String description,
            String route,
            String reason,
            String priority,
            String type
    ) {
        return RecommendationCardResponse.builder()
                .title(title)
                .description(description)
                .route(route)
                .reason(reason)
                .priority(priority)
                .recommendationType(type)
                .build();
    }

    private static final class TopicAccumulator {
        private final String track;
        private long attempts;
        private long successes;

        private TopicAccumulator(String track) {
            this.track = track;
        }
    }
}
