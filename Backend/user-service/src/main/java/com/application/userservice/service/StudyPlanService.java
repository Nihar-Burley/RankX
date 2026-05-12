package com.application.userservice.service;

import com.application.userservice.client.ProblemServiceClient;
import com.application.userservice.client.QuizServiceClient;
import com.application.userservice.dto.ActivityProgressUpdateRequest;
import com.application.userservice.dto.ActivityProgressUpdateResponse;
import com.application.userservice.dto.AdminStudyPlanItemRequest;
import com.application.userservice.dto.AdminStudyPlanRequest;
import com.application.userservice.dto.AdminStudyPlanResponse;
import com.application.userservice.dto.ProgressSummaryResponse;
import com.application.userservice.dto.StudyPlanDetailResponse;
import com.application.userservice.dto.StudyPlanProgressResponse;
import com.application.userservice.dto.StudyPlanResponse;
import com.application.userservice.dto.UserStudyPlanResponse;
import com.application.userservice.entity.StudyPlan;
import com.application.userservice.entity.StudyPlanItem;
import com.application.userservice.entity.StudyPlanItemType;
import com.application.userservice.entity.UserStreak;
import com.application.userservice.entity.UserStudyPlan;
import com.application.userservice.entity.UserStudyPlanItemProgress;
import com.application.userservice.repository.StudyPlanRepository;
import com.application.userservice.repository.UserStreakRepository;
import com.application.userservice.repository.UserStudyPlanItemProgressRepository;
import com.application.userservice.repository.UserStudyPlanRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class StudyPlanService {

    private static final String ADMIN_VALIDATION_USER_ID = "00000000-0000-0000-0000-000000000001";
    private static final String CONTENT_VALIDATION_ROLE = "ROLE_USER";

    private final StudyPlanRepository studyPlanRepository;
    private final UserStudyPlanRepository userStudyPlanRepository;
    private final UserStudyPlanItemProgressRepository itemProgressRepository;
    private final UserStreakRepository userStreakRepository;
    private final ProblemServiceClient problemServiceClient;
    private final QuizServiceClient quizServiceClient;

    public StudyPlanService(
            StudyPlanRepository studyPlanRepository,
            UserStudyPlanRepository userStudyPlanRepository,
            UserStudyPlanItemProgressRepository itemProgressRepository,
            UserStreakRepository userStreakRepository,
            ProblemServiceClient problemServiceClient,
            QuizServiceClient quizServiceClient
    ) {
        this.studyPlanRepository = studyPlanRepository;
        this.userStudyPlanRepository = userStudyPlanRepository;
        this.itemProgressRepository = itemProgressRepository;
        this.userStreakRepository = userStreakRepository;
        this.problemServiceClient = problemServiceClient;
        this.quizServiceClient = quizServiceClient;
    }

    @Transactional(readOnly = true)
    public List<AdminStudyPlanResponse> getAdminStudyPlans() {
        return studyPlanRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::mapAdminStudyPlan)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminStudyPlanResponse getAdminStudyPlan(Long studyPlanId) {
        return mapAdminStudyPlan(getDetailedStudyPlan(studyPlanId));
    }

    public AdminStudyPlanResponse createStudyPlan(AdminStudyPlanRequest request) {
        String normalizedSlug = normalizeSlug(request.getSlug());
        studyPlanRepository.findBySlugIgnoreCase(normalizedSlug)
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Study plan slug already exists");
                });

        StudyPlan studyPlan = StudyPlan.builder()
                .slug(normalizedSlug)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .track(request.getTrack().trim())
                .level(request.getLevel().trim())
                .active(request.getActive() == null || request.getActive())
                .items(new ArrayList<>())
                .build();

        synchronizeItems(studyPlan, request.getItems());
        return mapAdminStudyPlan(studyPlanRepository.save(studyPlan));
    }

    public AdminStudyPlanResponse updateStudyPlan(Long studyPlanId, AdminStudyPlanRequest request) {
        StudyPlan studyPlan = getDetailedStudyPlan(studyPlanId);
        String normalizedSlug = normalizeSlug(request.getSlug());

        studyPlanRepository.findBySlugIgnoreCase(normalizedSlug)
                .filter(existing -> !Objects.equals(existing.getId(), studyPlanId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Study plan slug already exists");
                });

        studyPlan.setSlug(normalizedSlug);
        studyPlan.setTitle(request.getTitle().trim());
        studyPlan.setDescription(request.getDescription().trim());
        studyPlan.setTrack(request.getTrack().trim());
        studyPlan.setLevel(request.getLevel().trim());
        if (request.getActive() != null) {
            studyPlan.setActive(request.getActive());
        }

        synchronizeItems(studyPlan, request.getItems());
        return mapAdminStudyPlan(studyPlanRepository.save(studyPlan));
    }

    public AdminStudyPlanResponse deactivateStudyPlan(Long studyPlanId) {
        StudyPlan studyPlan = getDetailedStudyPlan(studyPlanId);
        studyPlan.setActive(false);
        return mapAdminStudyPlan(studyPlanRepository.save(studyPlan));
    }

    @Transactional(readOnly = true)
    public List<StudyPlanResponse> getStudyPlans(UUID userId) {
        List<Long> enrolledPlanIds = userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(userId)
                .stream()
                .map(userStudyPlan -> userStudyPlan.getStudyPlan().getId())
                .toList();

        return studyPlanRepository.findByActiveTrueOrderByTitleAsc()
                .stream()
                .map(plan -> mapStudyPlan(plan, enrolledPlanIds.contains(plan.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public StudyPlanDetailResponse getStudyPlanDetail(UUID userId, Long studyPlanId) {
        StudyPlan studyPlan = getActiveStudyPlan(studyPlanId);
        UserStudyPlan userStudyPlan = userStudyPlanRepository.findByUserIdAndStudyPlanId(userId, studyPlanId)
                .orElse(null);
        boolean enrolled = userStudyPlan != null;
        Map<Long, Boolean> completionMap = enrolled
                ? buildCompletionMap(userStudyPlan)
                : Map.of();
        Long nextIncompleteItemId = findNextIncompleteItemId(studyPlan.getItems(), completionMap);

        return StudyPlanDetailResponse.builder()
                .id(studyPlan.getId())
                .slug(studyPlan.getSlug())
                .title(studyPlan.getTitle())
                .description(studyPlan.getDescription())
                .track(studyPlan.getTrack())
                .level(studyPlan.getLevel())
                .enrolled(enrolled)
                .items(studyPlan.getItems().stream()
                        .sorted(Comparator.comparing(StudyPlanItem::getSequenceNumber))
                        .map(item -> StudyPlanDetailResponse.StudyPlanItemResponse.builder()
                                .id(item.getId())
                                .sequenceNumber(item.getSequenceNumber())
                                .title(item.getTitle())
                                .description(item.getDescription())
                                .itemType(item.getItemType().name())
                                .referenceKey(resolveReferenceKey(item))
                                .estimatedMinutes(item.getEstimatedMinutes())
                                .progressState(determineItemState(item, completionMap, nextIncompleteItemId, enrolled))
                                .build())
                        .toList())
                .build();
    }

    public UserStudyPlanResponse enroll(UUID userId, Long studyPlanId) {
        StudyPlan studyPlan = getActiveStudyPlan(studyPlanId);

        if (userStudyPlanRepository.existsByUserIdAndStudyPlanId(userId, studyPlanId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already enrolled in this study plan");
        }

        UserStudyPlan userStudyPlan = userStudyPlanRepository.save(UserStudyPlan.builder()
                .userId(userId)
                .studyPlan(studyPlan)
                .completionPercentage(0.0)
                .active(true)
                .build());

        studyPlan.getItems().forEach(item -> itemProgressRepository.save(
                UserStudyPlanItemProgress.builder()
                        .userStudyPlan(userStudyPlan)
                        .studyPlanItem(item)
                        .completed(false)
                        .build()
        ));

        ensureUserStreak(userId);
        return mapUserStudyPlan(userStudyPlan, resolveNextItemTitle(userStudyPlan));
    }

    @Transactional(readOnly = true)
    public List<UserStudyPlanResponse> getUserStudyPlans(UUID userId) {
        return userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(userId)
                .stream()
                .map(plan -> mapUserStudyPlan(plan, resolveNextItemTitle(plan)))
                .toList();
    }

    @Transactional(readOnly = true)
    public StudyPlanProgressResponse getStudyPlanProgress(UUID userId, Long studyPlanId) {
        UserStudyPlan userStudyPlan = userStudyPlanRepository.findByUserIdAndStudyPlanId(userId, studyPlanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study plan enrollment not found"));

        List<UserStudyPlanItemProgress> progressEntries = itemProgressRepository.findByUserStudyPlanId(userStudyPlan.getId());
        Map<Long, UserStudyPlanItemProgress> progressByItemId = progressEntries.stream()
                .collect(Collectors.toMap(entry -> entry.getStudyPlanItem().getId(), Function.identity()));
        Map<Long, Boolean> completionMap = progressEntries.stream()
                .collect(Collectors.toMap(entry -> entry.getStudyPlanItem().getId(), UserStudyPlanItemProgress::isCompleted));

        List<StudyPlanItem> items = userStudyPlan.getStudyPlan().getItems().stream()
                .sorted(Comparator.comparing(StudyPlanItem::getSequenceNumber))
                .toList();

        int completedItems = (int) progressEntries.stream().filter(UserStudyPlanItemProgress::isCompleted).count();
        String nextItemTitle = resolveNextItemTitle(userStudyPlan);
        Long nextIncompleteItemId = findNextIncompleteItemId(items, completionMap);

        List<StudyPlanProgressResponse.ItemProgress> itemResponses = items.stream()
                .map(item -> {
                    UserStudyPlanItemProgress progress = progressByItemId.get(item.getId());
                    return StudyPlanProgressResponse.ItemProgress.builder()
                            .itemId(item.getId())
                            .sequenceNumber(item.getSequenceNumber())
                            .title(item.getTitle())
                            .itemType(item.getItemType().name())
                            .referenceKey(resolveReferenceKey(item))
                            .completed(progress != null && progress.isCompleted())
                            .progressState(determineItemState(item, completionMap, nextIncompleteItemId, true))
                            .build();
                })
                .toList();

        return StudyPlanProgressResponse.builder()
                .studyPlanId(userStudyPlan.getStudyPlan().getId())
                .title(userStudyPlan.getStudyPlan().getTitle())
                .completionPercentage(calculateCompletionPercentage(items.size(), completedItems))
                .totalItems(items.size())
                .completedItems(completedItems)
                .nextItemTitle(nextItemTitle)
                .items(itemResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public ProgressSummaryResponse getProgressSummary(UUID userId) {
        List<UserStudyPlan> enrolledPlans = userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(userId);
        UserStudyPlan currentPlan = enrolledPlans.stream().findFirst().orElse(null);

        return ProgressSummaryResponse.builder()
                .enrolledPlans(enrolledPlans.size())
                .streakCount(userStreakRepository.findByUserId(userId)
                        .map(UserStreak::getCurrentStreak)
                        .orElse(0))
                .currentPlan(currentPlan == null ? null : ProgressSummaryResponse.CurrentPlan.builder()
                        .studyPlanId(currentPlan.getStudyPlan().getId())
                        .title(currentPlan.getStudyPlan().getTitle())
                        .completionPercentage(currentPlan.getCompletionPercentage())
                        .nextItemTitle(resolveNextItemTitle(currentPlan))
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public StudyPlanNextItemView getCurrentNextItem(UUID userId) {
        UserStudyPlan currentPlan = userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(userId)
                .stream()
                .findFirst()
                .orElse(null);

        if (currentPlan == null) {
            return null;
        }

        Map<Long, Boolean> completionMap = buildCompletionMap(currentPlan);

        return currentPlan.getStudyPlan().getItems().stream()
                .sorted(Comparator.comparing(StudyPlanItem::getSequenceNumber))
                .filter(item -> !completionMap.getOrDefault(item.getId(), false))
                .findFirst()
                .map(item -> new StudyPlanNextItemView(
                        currentPlan.getStudyPlan().getId(),
                        currentPlan.getStudyPlan().getTitle(),
                        item.getId(),
                        item.getTitle(),
                        item.getItemType().name(),
                        resolveReferenceKey(item),
                        currentPlan.getCompletionPercentage(),
                        currentPlan.getStudyPlan().getLevel()
                ))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public long countCompletedItems(UUID userId) {
        return userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(userId)
                .stream()
                .map(UserStudyPlan::getId)
                .map(itemProgressRepository::findByUserStudyPlanId)
                .flatMap(List::stream)
                .filter(UserStudyPlanItemProgress::isCompleted)
                .count();
    }

    public ActivityProgressUpdateResponse markActivityCompleted(UUID userId, ActivityProgressUpdateRequest request) {
        String normalizedItemType = normalizeItemType(request.getItemType());
        String normalizedReferenceKey = normalizeReferenceKey(request.getReferenceKey());
        List<UserStudyPlan> activePlans = userStudyPlanRepository.findByUserIdAndActiveTrueOrderByEnrolledAtDesc(userId);

        int affectedPlans = 0;
        int completedItems = 0;

        for (UserStudyPlan userStudyPlan : activePlans) {
            Map<Long, UserStudyPlanItemProgress> progressByItemId = itemProgressRepository
                    .findByUserStudyPlanId(userStudyPlan.getId())
                    .stream()
                    .collect(Collectors.toMap(progress -> progress.getStudyPlanItem().getId(), Function.identity()));

            boolean planChanged = false;
            for (StudyPlanItem item : userStudyPlan.getStudyPlan().getItems()) {
                if (!item.getItemType().name().equals(normalizedItemType)) {
                    continue;
                }
                if (!matchesReference(item, normalizedReferenceKey)) {
                    continue;
                }

                UserStudyPlanItemProgress progress = progressByItemId.get(item.getId());
                if (progress != null && !progress.isCompleted()) {
                    progress.setCompleted(true);
                    itemProgressRepository.save(progress);
                    completedItems++;
                    planChanged = true;
                }
            }

            if (planChanged) {
                updateCompletionPercentage(userStudyPlan, progressByItemId.values().stream().toList());
                userStudyPlanRepository.save(userStudyPlan);
                affectedPlans++;
            }
        }

        if (affectedPlans > 0) {
            log.info(
                    "Progress updated for user {} via {} event {} on reference {} | plans={}, items={}",
                    userId,
                    normalizedItemType,
                    request.getSourceEventId(),
                    normalizedReferenceKey,
                    affectedPlans,
                    completedItems
            );
        } else {
            log.debug(
                    "No study-plan progress change for user {} via {} event {} on reference {}",
                    userId,
                    normalizedItemType,
                    request.getSourceEventId(),
                    normalizedReferenceKey
            );
        }

        return ActivityProgressUpdateResponse.builder()
                .progressChanged(completedItems > 0)
                .affectedStudyPlans(affectedPlans)
                .completedItems(completedItems)
                .build();
    }

    private StudyPlan getActiveStudyPlan(Long studyPlanId) {
        return studyPlanRepository.findByIdAndActiveTrue(studyPlanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study plan not found"));
    }

    private StudyPlan getDetailedStudyPlan(Long studyPlanId) {
        return studyPlanRepository.findStudyPlanById(studyPlanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study plan not found"));
    }

    private StudyPlanResponse mapStudyPlan(StudyPlan studyPlan, boolean enrolled) {
        return StudyPlanResponse.builder()
                .id(studyPlan.getId())
                .slug(studyPlan.getSlug())
                .title(studyPlan.getTitle())
                .description(studyPlan.getDescription())
                .track(studyPlan.getTrack())
                .level(studyPlan.getLevel())
                .totalItems(studyPlan.getItems().size())
                .enrolled(enrolled)
                .build();
    }

    private UserStudyPlanResponse mapUserStudyPlan(UserStudyPlan userStudyPlan, String nextItemTitle) {
        return UserStudyPlanResponse.builder()
                .studyPlanId(userStudyPlan.getStudyPlan().getId())
                .title(userStudyPlan.getStudyPlan().getTitle())
                .track(userStudyPlan.getStudyPlan().getTrack())
                .level(userStudyPlan.getStudyPlan().getLevel())
                .enrolledAt(userStudyPlan.getEnrolledAt())
                .completionPercentage(userStudyPlan.getCompletionPercentage())
                .nextItemTitle(nextItemTitle)
                .build();
    }

    private AdminStudyPlanResponse mapAdminStudyPlan(StudyPlan studyPlan) {
        return AdminStudyPlanResponse.builder()
                .id(studyPlan.getId())
                .slug(studyPlan.getSlug())
                .title(studyPlan.getTitle())
                .description(studyPlan.getDescription())
                .track(studyPlan.getTrack())
                .level(studyPlan.getLevel())
                .active(studyPlan.isActive())
                .totalItems(studyPlan.getItems().size())
                .createdAt(studyPlan.getCreatedAt())
                .updatedAt(studyPlan.getUpdatedAt())
                .items(studyPlan.getItems().stream()
                        .sorted(Comparator.comparing(StudyPlanItem::getSequenceNumber))
                        .map(item -> AdminStudyPlanResponse.ItemResponse.builder()
                                .id(item.getId())
                                .sequenceNumber(item.getSequenceNumber())
                                .title(item.getTitle())
                                .description(item.getDescription())
                                .itemType(item.getItemType().name())
                                .referenceType(item.getReferenceType())
                                .referenceId(item.getReferenceId())
                                .referenceKey(resolveReferenceKey(item))
                                .estimatedMinutes(item.getEstimatedMinutes())
                                .build())
                        .toList())
                .build();
    }

    private Map<Long, Boolean> buildCompletionMap(UserStudyPlan userStudyPlan) {
        return itemProgressRepository.findByUserStudyPlanId(userStudyPlan.getId())
                .stream()
                .collect(Collectors.toMap(progress -> progress.getStudyPlanItem().getId(), UserStudyPlanItemProgress::isCompleted));
    }

    private String resolveNextItemTitle(UserStudyPlan userStudyPlan) {
        Map<Long, Boolean> completionMap = buildCompletionMap(userStudyPlan);

        return userStudyPlan.getStudyPlan().getItems().stream()
                .sorted(Comparator.comparing(StudyPlanItem::getSequenceNumber))
                .filter(item -> !completionMap.getOrDefault(item.getId(), false))
                .map(StudyPlanItem::getTitle)
                .findFirst()
                .orElse("Plan completed");
    }

    private Long findNextIncompleteItemId(List<StudyPlanItem> items, Map<Long, Boolean> completionMap) {
        return items.stream()
                .sorted(Comparator.comparing(StudyPlanItem::getSequenceNumber))
                .filter(item -> !completionMap.getOrDefault(item.getId(), false))
                .map(StudyPlanItem::getId)
                .findFirst()
                .orElse(null);
    }

    private String determineItemState(
            StudyPlanItem item,
            Map<Long, Boolean> completionMap,
            Long nextIncompleteItemId,
            boolean enrolled
    ) {
        if (completionMap.getOrDefault(item.getId(), false)) {
            return "COMPLETED";
        }
        if (!enrolled) {
            return item.getSequenceNumber() == 1 ? "NEXT" : "LOCKED";
        }
        if (Objects.equals(item.getId(), nextIncompleteItemId)) {
            return "NEXT";
        }
        return "LOCKED";
    }

    private void updateCompletionPercentage(UserStudyPlan userStudyPlan, List<UserStudyPlanItemProgress> progressEntries) {
        int totalItems = userStudyPlan.getStudyPlan().getItems().size();
        int completedItems = (int) progressEntries.stream()
                .filter(UserStudyPlanItemProgress::isCompleted)
                .count();
        userStudyPlan.setCompletionPercentage(calculateCompletionPercentage(totalItems, completedItems));
    }

    private boolean matchesReference(StudyPlanItem item, String normalizedReferenceKey) {
        String resolvedReferenceKey = normalizeReferenceKey(resolveReferenceKey(item));
        if (normalizedReferenceKey.equals(resolvedReferenceKey)) {
            return true;
        }

        String canonicalReferenceKey = buildCanonicalReferenceKey(item.getReferenceType(), item.getReferenceId());
        return normalizedReferenceKey.equals(normalizeReferenceKey(canonicalReferenceKey));
    }

    private String normalizeItemType(String itemType) {
        if (itemType == null || itemType.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item type is required");
        }
        try {
            return StudyPlanItemType.valueOf(itemType.trim().toUpperCase()).name();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported item type");
        }
    }

    private String normalizeReferenceKey(String referenceKey) {
        if (referenceKey == null || referenceKey.isBlank()) {
            return "";
        }
        return referenceKey.trim().toLowerCase();
    }

    private String resolveReferenceKey(StudyPlanItem item) {
        if (item.getReferenceKey() != null && !item.getReferenceKey().isBlank()) {
            return item.getReferenceKey();
        }
        return buildCanonicalReferenceKey(item.getReferenceType(), item.getReferenceId());
    }

    private String buildCanonicalReferenceKey(String referenceType, String referenceId) {
        if (referenceType == null || referenceType.isBlank() || referenceId == null || referenceId.isBlank()) {
            return "";
        }
        return referenceType.trim().toLowerCase() + "-" + referenceId.trim();
    }

    private void synchronizeItems(StudyPlan studyPlan, List<AdminStudyPlanItemRequest> itemRequests) {
        List<AdminStudyPlanItemRequest> safeItemRequests = itemRequests == null ? List.of() : itemRequests;
        ensureDistinctSequenceNumbers(safeItemRequests);

        List<StudyPlanItem> existingItems = new ArrayList<>(studyPlan.getItems());
        studyPlan.getItems().clear();

        for (AdminStudyPlanItemRequest itemRequest : safeItemRequests.stream()
                .sorted(Comparator.comparing(AdminStudyPlanItemRequest::getSequenceNumber))
                .toList()) {
            AdminItemReference reference = validateReference(itemRequest);
            StudyPlanItem item = existingItems.stream()
                    .filter(candidate -> Objects.equals(candidate.getSequenceNumber(), itemRequest.getSequenceNumber()))
                    .findFirst()
                    .orElseGet(StudyPlanItem::new);

            item.setStudyPlan(studyPlan);
            item.setSequenceNumber(itemRequest.getSequenceNumber());
            item.setTitle(itemRequest.getTitle().trim());
            item.setDescription(itemRequest.getDescription().trim());
            item.setItemType(reference.itemType());
            item.setReferenceType(reference.referenceType());
            item.setReferenceId(reference.referenceId());
            item.setReferenceKey(reference.referenceKey());
            item.setEstimatedMinutes(itemRequest.getEstimatedMinutes());
            studyPlan.getItems().add(item);
        }
    }

    private void ensureDistinctSequenceNumbers(List<AdminStudyPlanItemRequest> itemRequests) {
        long distinctCount = itemRequests.stream()
                .map(AdminStudyPlanItemRequest::getSequenceNumber)
                .distinct()
                .count();
        if (distinctCount != itemRequests.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Study plan item sequence numbers must be unique");
        }
    }

    private AdminItemReference validateReference(AdminStudyPlanItemRequest request) {
        StudyPlanItemType itemType = normalizeStudyPlanItemType(request.getItemType());
        String referenceType = normalizeReferenceType(request.getReferenceType(), itemType);
        String referenceId = request.getReferenceId().trim();

        try {
            if ("problem".equals(referenceType)) {
                if (itemType != StudyPlanItemType.CODING_PROBLEM) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coding problem items must use problem references");
                }
                problemServiceClient.getProblemById(Long.valueOf(referenceId));
            } else {
                if (itemType != StudyPlanItemType.QUIZ) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz items must use quiz references");
                }
                quizServiceClient.getQuizById(UUID.fromString(referenceId), ADMIN_VALIDATION_USER_ID, CONTENT_VALIDATION_ROLE);
            }
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reference ID format");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Referenced content could not be validated");
        }

        return new AdminItemReference(
                itemType,
                referenceType,
                referenceId,
                buildCanonicalReferenceKey(referenceType, referenceId)
        );
    }

    private StudyPlanItemType normalizeStudyPlanItemType(String itemType) {
        try {
            return StudyPlanItemType.valueOf(itemType.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported study plan item type");
        }
    }

    private String normalizeReferenceType(String referenceType, StudyPlanItemType itemType) {
        String normalized = referenceType.trim().toLowerCase();
        if (!List.of("problem", "quiz").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported reference type");
        }
        if ("problem".equals(normalized) && itemType != StudyPlanItemType.CODING_PROBLEM) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coding problem items must use problem references");
        }
        if ("quiz".equals(normalized) && itemType != StudyPlanItemType.QUIZ) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz items must use quiz references");
        }
        return normalized;
    }

    private String normalizeSlug(String slug) {
        String normalized = slug.trim().toLowerCase().replace(' ', '-');
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Study plan slug is required");
        }
        return normalized;
    }

    private void ensureUserStreak(UUID userId) {
        userStreakRepository.findByUserId(userId).orElseGet(() ->
                userStreakRepository.save(UserStreak.builder()
                        .userId(userId)
                        .currentStreak(1)
                        .longestStreak(1)
                        .lastActivityDate(LocalDate.now())
                        .build())
        );
    }

    private double calculateCompletionPercentage(int totalItems, int completedItems) {
        if (totalItems == 0) {
            return 0.0;
        }
        return (completedItems * 100.0) / totalItems;
    }

    private record AdminItemReference(
            StudyPlanItemType itemType,
            String referenceType,
            String referenceId,
            String referenceKey
    ) {
    }

    public record StudyPlanNextItemView(
            Long studyPlanId,
            String studyPlanTitle,
            Long itemId,
            String itemTitle,
            String itemType,
            String referenceKey,
            double completionPercentage,
            String level
    ) {
    }
}
