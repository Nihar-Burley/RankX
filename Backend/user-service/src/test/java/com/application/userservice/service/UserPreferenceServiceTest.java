package com.application.userservice.service;

import com.application.userservice.dto.DashboardSummaryResponse;
import com.application.userservice.dto.UserPreferenceRequest;
import com.application.userservice.dto.UserPreferenceResponse;
import com.application.userservice.entity.UserPreference;
import com.application.userservice.repository.UserPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserPreferenceServiceTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private UserPreferenceRepository userPreferenceRepository;

    @InjectMocks
    private UserPreferenceService userPreferenceService;

    @Captor
    private ArgumentCaptor<UserPreference> preferenceCaptor;

    private UserPreferenceRequest request;

    @BeforeEach
    void setUp() {
        request = new UserPreferenceRequest();
        request.setGoal("Interview Prep");
        request.setPreferredTrack("Coding");
        request.setSkillLevel("Intermediate");
    }

    @Test
    void shouldCreatePreferencesWhenMissing() {
        when(userPreferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(userPreferenceRepository.save(any(UserPreference.class))).thenAnswer(invocation -> {
            UserPreference saved = invocation.getArgument(0);
            saved.setId(1L);
            saved.setCreatedAt(LocalDateTime.now());
            saved.setUpdatedAt(LocalDateTime.now());
            return saved;
        });

        UserPreferenceResponse response = userPreferenceService.updatePreferences(USER_ID, request);

        verify(userPreferenceRepository).save(preferenceCaptor.capture());
        UserPreference savedPreference = preferenceCaptor.getValue();
        assertThat(savedPreference.getUserId()).isEqualTo(USER_ID);
        assertThat(savedPreference.getGoal()).isEqualTo("Interview Prep");
        assertThat(savedPreference.getPreferredTrack()).isEqualTo("Coding");
        assertThat(savedPreference.getSkillLevel()).isEqualTo("Intermediate");
        assertThat(savedPreference.isOnboardingCompleted()).isTrue();
        assertThat(response.isOnboardingCompleted()).isTrue();
    }

    @Test
    void shouldUpdateExistingPreferences() {
        UserPreference existing = UserPreference.builder()
                .id(9L)
                .userId(USER_ID)
                .goal("Skill Improvement")
                .preferredTrack("Quiz")
                .skillLevel("Beginner")
                .onboardingCompleted(false)
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusHours(1))
                .build();

        when(userPreferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.of(existing));
        when(userPreferenceRepository.save(existing)).thenReturn(existing);

        UserPreferenceResponse response = userPreferenceService.updatePreferences(USER_ID, request);

        assertThat(existing.getGoal()).isEqualTo("Interview Prep");
        assertThat(existing.getPreferredTrack()).isEqualTo("Coding");
        assertThat(existing.getSkillLevel()).isEqualTo("Intermediate");
        assertThat(existing.isOnboardingCompleted()).isTrue();
        assertThat(response.getGoal()).isEqualTo("Interview Prep");
    }

    @Test
    void shouldReturnMissingPreferencesGracefully() {
        when(userPreferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        UserPreferenceResponse response = userPreferenceService.getPreferences(USER_ID);

        assertThat(response.getUserId()).isEqualTo(USER_ID.toString());
        assertThat(response.getGoal()).isNull();
        assertThat(response.isOnboardingCompleted()).isFalse();
    }

    @Test
    void shouldBuildDashboardSummaryForIncompleteOnboarding() {
        when(userPreferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        DashboardSummaryResponse response = userPreferenceService.getDashboardSummary(
                USER_ID,
                "ROLE_USER",
                "User Demo"
        );

        assertThat(response.isOnboardingCompleted()).isFalse();
        assertThat(response.getRecommendedFirstAction().getRoute()).isEqualTo("/onboarding");
        assertThat(response.getChecklist()).hasSize(5);
        assertThat(response.getChecklist().getFirst().isCompleted()).isFalse();
    }

    @Test
    void shouldBuildDashboardSummaryForCodingTrack() {
        UserPreference preference = UserPreference.builder()
                .id(4L)
                .userId(USER_ID)
                .goal("Interview Prep")
                .preferredTrack("Coding")
                .skillLevel("Advanced")
                .onboardingCompleted(true)
                .createdAt(LocalDateTime.now().minusDays(2))
                .updatedAt(LocalDateTime.now().minusHours(2))
                .build();

        when(userPreferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.of(preference));

        DashboardSummaryResponse response = userPreferenceService.getDashboardSummary(
                USER_ID,
                "ROLE_USER",
                "User Demo"
        );

        assertThat(response.isOnboardingCompleted()).isTrue();
        assertThat(response.getRecommendedFirstAction().getRoute()).isEqualTo("/problems");
        assertThat(response.getRecommendedFirstAction().getTitle()).contains("coding");
        assertThat(response.getChecklist().getFirst().isCompleted()).isTrue();
    }

    @Test
    void shouldPreferQuizActionForCollegeExamUsersOnBothTrack() {
        UserPreference preference = UserPreference.builder()
                .id(5L)
                .userId(USER_ID)
                .goal("College/Exam Practice")
                .preferredTrack("Both")
                .skillLevel("Beginner")
                .onboardingCompleted(true)
                .build();

        when(userPreferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.of(preference));

        DashboardSummaryResponse response = userPreferenceService.getDashboardSummary(
                USER_ID,
                "ROLE_USER",
                "User Demo"
        );

        assertThat(response.getRecommendedFirstAction().getRoute()).isEqualTo("/quiz");
        assertThat(response.getRecommendedFirstAction().getTitle()).containsIgnoringCase("quiz");
    }

    @Test
    void shouldFallbackToDashboardForUnexpectedTrackValues() {
        UserPreference preference = UserPreference.builder()
                .id(6L)
                .userId(USER_ID)
                .goal("Skill Improvement")
                .preferredTrack("SomethingElse")
                .skillLevel("Intermediate")
                .onboardingCompleted(true)
                .build();

        when(userPreferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.of(preference));

        DashboardSummaryResponse response = userPreferenceService.getDashboardSummary(
                USER_ID,
                "ROLE_USER",
                "User Demo"
        );

        assertThat(response.getRecommendedFirstAction().getRoute()).isEqualTo("/home");
        assertThat(response.getRecommendedFirstAction().getTitle()).isEqualTo("Explore your dashboard");
    }
}
