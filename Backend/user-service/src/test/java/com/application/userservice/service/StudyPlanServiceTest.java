package com.application.userservice.service;

import com.application.userservice.client.ProblemServiceClient;
import com.application.userservice.client.QuizServiceClient;
import com.application.userservice.dto.ActivityProgressUpdateRequest;
import com.application.userservice.dto.ActivityProgressUpdateResponse;
import com.application.userservice.dto.AdminStudyPlanItemRequest;
import com.application.userservice.dto.AdminStudyPlanRequest;
import com.application.userservice.dto.AdminStudyPlanResponse;
import com.application.userservice.dto.ProblemMetadataView;
import com.application.userservice.dto.ProgressSummaryResponse;
import com.application.userservice.dto.QuizMetadataView;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudyPlanServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID ADMIN_QUIZ_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Mock
    private StudyPlanRepository studyPlanRepository;

    @Mock
    private UserStudyPlanRepository userStudyPlanRepository;

    @Mock
    private UserStudyPlanItemProgressRepository itemProgressRepository;

    @Mock
    private UserStreakRepository userStreakRepository;

    @Mock
    private ProblemServiceClient problemServiceClient;

    @Mock
    private QuizServiceClient quizServiceClient;

    @InjectMocks
    private StudyPlanService studyPlanService;

    @Captor
    private ArgumentCaptor<UserStudyPlan> userStudyPlanCaptor;

    private StudyPlan studyPlan;
    private StudyPlanItem firstItem;
    private StudyPlanItem secondItem;

    @BeforeEach
    void setUp() {
        firstItem = StudyPlanItem.builder()
                .id(11L)
                .sequenceNumber(1)
                .title("Arrays warmup")
                .description("Solve first array challenge")
                .itemType(StudyPlanItemType.CODING_PROBLEM)
                .referenceType("problem")
                .referenceId("101")
                .referenceKey("problem-101")
                .estimatedMinutes(30)
                .build();

        secondItem = StudyPlanItem.builder()
                .id(12L)
                .sequenceNumber(2)
                .title("Java basics quiz")
                .description("Attempt the Java basics quiz")
                .itemType(StudyPlanItemType.QUIZ)
                .referenceType("quiz")
                .referenceId("205")
                .referenceKey("quiz-205")
                .estimatedMinutes(20)
                .build();

        studyPlan = StudyPlan.builder()
                .id(1L)
                .slug("dsa-basics")
                .title("DSA Basics")
                .description("Foundational practice path")
                .track("Coding")
                .level("Beginner")
                .active(true)
                .items(new ArrayList<>(List.of(firstItem, secondItem)))
                .build();

        firstItem.setStudyPlan(studyPlan);
        secondItem.setStudyPlan(studyPlan);
    }

    @Test
    void shouldListStudyPlans() {
        when(userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of());
        when(studyPlanRepository.findByActiveTrueOrderByTitleAsc()).thenReturn(List.of(studyPlan));

        List<StudyPlanResponse> response = studyPlanService.getStudyPlans(USER_ID);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().getTitle()).isEqualTo("DSA Basics");
        assertThat(response.getFirst().getTotalItems()).isEqualTo(2);
        assertThat(response.getFirst().isEnrolled()).isFalse();
    }

    @Test
    void shouldGetStudyPlanDetail() {
        when(studyPlanRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(studyPlan));
        when(userStudyPlanRepository.findByUserIdAndStudyPlanId(USER_ID, 1L)).thenReturn(Optional.of(
                UserStudyPlan.builder()
                        .id(18L)
                        .userId(USER_ID)
                        .studyPlan(studyPlan)
                        .completionPercentage(0.0)
                        .active(true)
                        .build()
        ));
        when(itemProgressRepository.findByUserStudyPlanId(18L)).thenReturn(List.of(
                UserStudyPlanItemProgress.builder()
                        .studyPlanItem(firstItem)
                        .completed(false)
                        .build(),
                UserStudyPlanItemProgress.builder()
                        .studyPlanItem(secondItem)
                        .completed(false)
                        .build()
        ));

        StudyPlanDetailResponse response = studyPlanService.getStudyPlanDetail(USER_ID, 1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.isEnrolled()).isTrue();
        assertThat(response.getItems()).hasSize(2);
        assertThat(response.getItems().getFirst().getItemType()).isEqualTo("CODING_PROBLEM");
        assertThat(response.getItems().getFirst().getProgressState()).isEqualTo("NEXT");
        assertThat(response.getItems().get(1).getProgressState()).isEqualTo("LOCKED");
    }

    @Test
    void shouldEnrollInStudyPlan() {
        when(studyPlanRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(studyPlan));
        when(userStudyPlanRepository.existsByUserIdAndStudyPlanId(USER_ID, 1L)).thenReturn(false);
        when(userStudyPlanRepository.save(any(UserStudyPlan.class))).thenAnswer(invocation -> {
            UserStudyPlan saved = invocation.getArgument(0);
            saved.setId(77L);
            saved.setEnrolledAt(LocalDateTime.now());
            return saved;
        });
        when(itemProgressRepository.save(any(UserStudyPlanItemProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userStreakRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(userStreakRepository.save(any(UserStreak.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserStudyPlanResponse response = studyPlanService.enroll(USER_ID, 1L);

        verify(userStudyPlanRepository).save(userStudyPlanCaptor.capture());
        verify(itemProgressRepository, times(2)).save(any(UserStudyPlanItemProgress.class));
        assertThat(userStudyPlanCaptor.getValue().getUserId()).isEqualTo(USER_ID);
        assertThat(response.getStudyPlanId()).isEqualTo(1L);
        assertThat(response.getCompletionPercentage()).isEqualTo(0.0);
        assertThat(response.getNextItemTitle()).isEqualTo("Arrays warmup");
    }

    @Test
    void shouldPreventDuplicateEnrollment() {
        when(studyPlanRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(studyPlan));
        when(userStudyPlanRepository.existsByUserIdAndStudyPlanId(USER_ID, 1L)).thenReturn(true);

        assertThatThrownBy(() -> studyPlanService.enroll(USER_ID, 1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already enrolled");

        verify(userStudyPlanRepository, never()).save(any(UserStudyPlan.class));
    }

    @Test
    void shouldGetUserStudyPlans() {
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(44L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .enrolledAt(LocalDateTime.now().minusDays(1))
                .completionPercentage(50.0)
                .active(true)
                .build();

        when(userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of(enrollment));
        when(itemProgressRepository.findByUserStudyPlanId(44L)).thenReturn(List.of(
                UserStudyPlanItemProgress.builder()
                        .studyPlanItem(firstItem)
                        .completed(true)
                        .build(),
                UserStudyPlanItemProgress.builder()
                        .studyPlanItem(secondItem)
                        .completed(false)
                        .build()
        ));

        List<UserStudyPlanResponse> response = studyPlanService.getUserStudyPlans(USER_ID);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().getNextItemTitle()).isEqualTo("Java basics quiz");
        assertThat(response.getFirst().getCompletionPercentage()).isEqualTo(50.0);
    }

    @Test
    void shouldGetStudyPlanProgress() {
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(55L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .enrolledAt(LocalDateTime.now().minusDays(1))
                .completionPercentage(50.0)
                .active(true)
                .build();

        when(userStudyPlanRepository.findByUserIdAndStudyPlanId(USER_ID, 1L)).thenReturn(Optional.of(enrollment));
        when(itemProgressRepository.findByUserStudyPlanId(55L)).thenReturn(List.of(
                UserStudyPlanItemProgress.builder()
                        .userStudyPlan(enrollment)
                        .studyPlanItem(firstItem)
                        .completed(true)
                        .build(),
                UserStudyPlanItemProgress.builder()
                        .userStudyPlan(enrollment)
                        .studyPlanItem(secondItem)
                        .completed(false)
                        .build()
        ));

        StudyPlanProgressResponse response = studyPlanService.getStudyPlanProgress(USER_ID, 1L);

        assertThat(response.getCompletedItems()).isEqualTo(1);
        assertThat(response.getTotalItems()).isEqualTo(2);
        assertThat(response.getNextItemTitle()).isEqualTo("Java basics quiz");
        assertThat(response.getItems()).hasSize(2);
        assertThat(response.getItems().getFirst().getProgressState()).isEqualTo("COMPLETED");
        assertThat(response.getItems().get(1).getProgressState()).isEqualTo("NEXT");
    }

    @Test
    void shouldBuildProgressSummaryResponse() {
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(61L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .enrolledAt(LocalDateTime.now().minusDays(2))
                .completionPercentage(25.0)
                .active(true)
                .build();

        when(userStudyPlanRepository.findByUserIdOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of(enrollment));
        when(userStreakRepository.findByUserId(USER_ID)).thenReturn(Optional.of(UserStreak.builder()
                .userId(USER_ID)
                .currentStreak(3)
                .longestStreak(4)
                .lastActivityDate(LocalDate.now())
                .build()));
        when(itemProgressRepository.findByUserStudyPlanId(61L)).thenReturn(List.of(
                UserStudyPlanItemProgress.builder()
                        .studyPlanItem(firstItem)
                        .completed(false)
                        .build(),
                UserStudyPlanItemProgress.builder()
                        .studyPlanItem(secondItem)
                        .completed(false)
                        .build()
        ));

        ProgressSummaryResponse response = studyPlanService.getProgressSummary(USER_ID);

        assertThat(response.getEnrolledPlans()).isEqualTo(1);
        assertThat(response.getStreakCount()).isEqualTo(3);
        assertThat(response.getCurrentPlan()).isNotNull();
        assertThat(response.getCurrentPlan().getTitle()).isEqualTo("DSA Basics");
        assertThat(response.getCurrentPlan().getNextItemTitle()).isEqualTo("Arrays warmup");
    }

    @Test
    void acceptedCodingSubmissionShouldUpdateProgress() {
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(88L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .completionPercentage(0.0)
                .active(true)
                .build();

        UserStudyPlanItemProgress firstProgress = UserStudyPlanItemProgress.builder()
                .userStudyPlan(enrollment)
                .studyPlanItem(firstItem)
                .completed(false)
                .build();
        UserStudyPlanItemProgress secondProgress = UserStudyPlanItemProgress.builder()
                .userStudyPlan(enrollment)
                .studyPlanItem(secondItem)
                .completed(false)
                .build();

        when(userStudyPlanRepository.findByUserIdAndActiveTrueOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of(enrollment));
        when(itemProgressRepository.findByUserStudyPlanId(88L)).thenReturn(List.of(firstProgress, secondProgress));

        ActivityProgressUpdateResponse response = studyPlanService.markActivityCompleted(
                USER_ID,
                ActivityProgressUpdateRequest.builder()
                        .itemType("CODING_PROBLEM")
                        .referenceKey("problem-101")
                        .sourceEventId("submission-44")
                        .build()
        );

        assertThat(response.isProgressChanged()).isTrue();
        assertThat(response.getAffectedStudyPlans()).isEqualTo(1);
        assertThat(response.getCompletedItems()).isEqualTo(1);
        assertThat(firstProgress.isCompleted()).isTrue();
        assertThat(enrollment.getCompletionPercentage()).isEqualTo(50.0);
    }

    @Test
    void duplicateCompletionShouldBeIdempotent() {
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(89L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .completionPercentage(50.0)
                .active(true)
                .build();

        when(userStudyPlanRepository.findByUserIdAndActiveTrueOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of(enrollment));
        when(itemProgressRepository.findByUserStudyPlanId(89L)).thenReturn(List.of(
                UserStudyPlanItemProgress.builder()
                        .userStudyPlan(enrollment)
                        .studyPlanItem(firstItem)
                        .completed(true)
                        .build(),
                UserStudyPlanItemProgress.builder()
                        .userStudyPlan(enrollment)
                        .studyPlanItem(secondItem)
                        .completed(false)
                        .build()
        ));

        ActivityProgressUpdateResponse response = studyPlanService.markActivityCompleted(
                USER_ID,
                ActivityProgressUpdateRequest.builder()
                        .itemType("CODING_PROBLEM")
                        .referenceKey("problem-101")
                        .sourceEventId("submission-44")
                        .build()
        );

        assertThat(response.isProgressChanged()).isFalse();
        assertThat(response.getCompletedItems()).isZero();
    }

    @Test
    void failedCodingSubmissionShouldNotCompleteProgress() {
        when(userStudyPlanRepository.findByUserIdAndActiveTrueOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of());

        ActivityProgressUpdateResponse response = studyPlanService.markActivityCompleted(
                USER_ID,
                ActivityProgressUpdateRequest.builder()
                        .itemType("CODING_PROBLEM")
                        .referenceKey("problem-999")
                        .sourceEventId("submission-90")
                        .build()
        );

        assertThat(response.isProgressChanged()).isFalse();
        assertThat(response.getAffectedStudyPlans()).isZero();
    }

    @Test
    void completedQuizResultShouldUpdateProgress() {
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(90L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .completionPercentage(50.0)
                .active(true)
                .build();

        when(userStudyPlanRepository.findByUserIdAndActiveTrueOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of(enrollment));
        when(itemProgressRepository.findByUserStudyPlanId(90L)).thenReturn(List.of(
                UserStudyPlanItemProgress.builder()
                        .userStudyPlan(enrollment)
                        .studyPlanItem(firstItem)
                        .completed(true)
                        .build(),
                UserStudyPlanItemProgress.builder()
                        .userStudyPlan(enrollment)
                        .studyPlanItem(secondItem)
                        .completed(false)
                        .build()
        ));

        ActivityProgressUpdateResponse response = studyPlanService.markActivityCompleted(
                USER_ID,
                ActivityProgressUpdateRequest.builder()
                        .itemType("QUIZ")
                        .referenceKey("quiz-205")
                        .sourceEventId("attempt-123")
                        .build()
        );

        assertThat(response.isProgressChanged()).isTrue();
        assertThat(response.getCompletedItems()).isEqualTo(1);
        assertThat(enrollment.getCompletionPercentage()).isEqualTo(100.0);
    }

    @Test
    void canonicalReferenceFieldsShouldMatchAcceptedSubmission() {
        firstItem.setReferenceKey("");
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(91L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .completionPercentage(0.0)
                .active(true)
                .build();

        UserStudyPlanItemProgress firstProgress = UserStudyPlanItemProgress.builder()
                .userStudyPlan(enrollment)
                .studyPlanItem(firstItem)
                .completed(false)
                .build();
        UserStudyPlanItemProgress secondProgress = UserStudyPlanItemProgress.builder()
                .userStudyPlan(enrollment)
                .studyPlanItem(secondItem)
                .completed(false)
                .build();

        when(userStudyPlanRepository.findByUserIdAndActiveTrueOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of(enrollment));
        when(itemProgressRepository.findByUserStudyPlanId(91L)).thenReturn(List.of(firstProgress, secondProgress));

        ActivityProgressUpdateResponse response = studyPlanService.markActivityCompleted(
                USER_ID,
                ActivityProgressUpdateRequest.builder()
                        .itemType("CODING_PROBLEM")
                        .referenceKey("problem-101")
                        .sourceEventId("submission-77")
                        .build()
        );

        assertThat(response.isProgressChanged()).isTrue();
        assertThat(firstProgress.isCompleted()).isTrue();
    }

    @Test
    void legacyReferenceKeyOnlyDataShouldStillWork() {
        firstItem.setReferenceType(null);
        firstItem.setReferenceId(null);
        UserStudyPlan enrollment = UserStudyPlan.builder()
                .id(92L)
                .userId(USER_ID)
                .studyPlan(studyPlan)
                .completionPercentage(0.0)
                .active(true)
                .build();

        UserStudyPlanItemProgress firstProgress = UserStudyPlanItemProgress.builder()
                .userStudyPlan(enrollment)
                .studyPlanItem(firstItem)
                .completed(false)
                .build();

        when(userStudyPlanRepository.findByUserIdAndActiveTrueOrderByEnrolledAtDesc(USER_ID)).thenReturn(List.of(enrollment));
        when(itemProgressRepository.findByUserStudyPlanId(92L)).thenReturn(List.of(firstProgress));

        ActivityProgressUpdateResponse response = studyPlanService.markActivityCompleted(
                USER_ID,
                ActivityProgressUpdateRequest.builder()
                        .itemType("CODING_PROBLEM")
                        .referenceKey("problem-101")
                        .sourceEventId("submission-88")
                        .build()
        );

        assertThat(response.isProgressChanged()).isTrue();
        assertThat(firstProgress.isCompleted()).isTrue();
    }

    @Test
    void adminShouldCreateStudyPlan() {
        AdminStudyPlanRequest request = adminRequest();
        when(problemServiceClient.getProblemById(101L)).thenReturn(new ProblemMetadataView());
        when(quizServiceClient.getQuizById(ADMIN_QUIZ_ID, "00000000-0000-0000-0000-000000000001", "ROLE_USER"))
                .thenReturn(new QuizMetadataView());
        when(studyPlanRepository.findBySlugIgnoreCase("mixed-foundations")).thenReturn(Optional.empty());
        when(studyPlanRepository.save(any(StudyPlan.class))).thenAnswer(invocation -> {
            StudyPlan saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        AdminStudyPlanResponse response = studyPlanService.createStudyPlan(request);

        assertThat(response.getId()).isEqualTo(7L);
        assertThat(response.getItems()).hasSize(2);
        assertThat(response.getItems().getFirst().getReferenceKey()).isEqualTo("problem-101");
    }

    @Test
    void adminShouldUpdateStudyPlan() {
        AdminStudyPlanRequest request = adminRequest();
        request.setTitle("Mixed Foundations Plus");
        when(problemServiceClient.getProblemById(101L)).thenReturn(new ProblemMetadataView());
        when(quizServiceClient.getQuizById(ADMIN_QUIZ_ID, "00000000-0000-0000-0000-000000000001", "ROLE_USER"))
                .thenReturn(new QuizMetadataView());
        when(studyPlanRepository.findStudyPlanById(1L)).thenReturn(Optional.of(studyPlan));
        when(studyPlanRepository.findBySlugIgnoreCase("mixed-foundations")).thenReturn(Optional.empty());
        when(studyPlanRepository.save(any(StudyPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminStudyPlanResponse response = studyPlanService.updateStudyPlan(1L, request);

        assertThat(response.getTitle()).isEqualTo("Mixed Foundations Plus");
        assertThat(studyPlan.getItems()).hasSize(2);
    }

    @Test
    void adminShouldDeactivateStudyPlan() {
        when(studyPlanRepository.findStudyPlanById(1L)).thenReturn(Optional.of(studyPlan));
        when(studyPlanRepository.save(any(StudyPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminStudyPlanResponse response = studyPlanService.deactivateStudyPlan(1L);

        assertThat(response.isActive()).isFalse();
        assertThat(studyPlan.isActive()).isFalse();
    }

    @Test
    void invalidProblemReferenceShouldBeRejected() {
        AdminStudyPlanRequest request = adminRequest();
        request.getItems().getFirst().setReferenceId("bad");

        assertThatThrownBy(() -> studyPlanService.createStudyPlan(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid reference ID format");
    }

    @Test
    void invalidQuizReferenceShouldBeRejected() {
        AdminStudyPlanRequest request = adminRequest();
        request.getItems().get(1).setReferenceId("missing-uuid");
        when(problemServiceClient.getProblemById(101L)).thenReturn(new ProblemMetadataView());

        assertThatThrownBy(() -> studyPlanService.createStudyPlan(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid reference ID format");
    }

    private AdminStudyPlanRequest adminRequest() {
        AdminStudyPlanItemRequest codingItem = new AdminStudyPlanItemRequest();
        codingItem.setSequenceNumber(1);
        codingItem.setTitle("Arrays warmup");
        codingItem.setDescription("Solve a coding warmup");
        codingItem.setItemType("CODING_PROBLEM");
        codingItem.setReferenceType("problem");
        codingItem.setReferenceId("101");
        codingItem.setEstimatedMinutes(20);

        AdminStudyPlanItemRequest quizItem = new AdminStudyPlanItemRequest();
        quizItem.setSequenceNumber(2);
        quizItem.setTitle("Java basics quiz");
        quizItem.setDescription("Attempt a checkpoint quiz");
        quizItem.setItemType("QUIZ");
        quizItem.setReferenceType("quiz");
        quizItem.setReferenceId(ADMIN_QUIZ_ID.toString());
        quizItem.setEstimatedMinutes(15);

        AdminStudyPlanRequest request = new AdminStudyPlanRequest();
        request.setSlug("mixed-foundations");
        request.setTitle("Mixed Foundations");
        request.setDescription("Blend coding and quiz practice.");
        request.setTrack("Both");
        request.setLevel("Intermediate");
        request.setActive(true);
        request.setItems(List.of(codingItem, quizItem));
        return request;
    }
}
