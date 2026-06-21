package com.application.userservice.controller;

import com.application.userservice.dto.DashboardSummaryResponse;
import com.application.userservice.dto.ProductEventResponse;
import com.application.userservice.dto.RecommendationCardResponse;
import com.application.userservice.dto.UserAnalyticsResponse;
import com.application.userservice.dto.UserPreferenceResponse;
import com.application.userservice.dto.UserProfileResponse;
import com.application.userservice.service.UserAnalyticsService;
import com.application.userservice.service.ProductEventService;
import com.application.userservice.service.StudyPlanService;
import com.application.userservice.service.UserPreferenceService;
import com.application.userservice.service.UserProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserProfileService userProfileService;

    @MockBean
    private UserPreferenceService userPreferenceService;

    @MockBean
    private StudyPlanService studyPlanService;

    @MockBean
    private UserAnalyticsService userAnalyticsService;

    @MockBean
    private ProductEventService productEventService;

    private Authentication authentication() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    void shouldGetProfile() throws Exception {
        when(userProfileService.getProfile(eq(USER_ID), eq("ROLE_USER")))
                .thenReturn(UserProfileResponse.builder()
                        .userId(USER_ID.toString())
                        .role("ROLE_USER")
                        .displayName("User Demo")
                        .onboardingCompleted(true)
                        .build());

        mockMvc.perform(get("/api/users/me").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID.toString()))
                .andExpect(jsonPath("$.onboardingCompleted").value(true));
    }

    @Test
    void shouldGetPreferences() throws Exception {
        when(userPreferenceService.getPreferences(USER_ID))
                .thenReturn(UserPreferenceResponse.builder()
                        .userId(USER_ID.toString())
                        .goal("Interview Prep")
                        .preferredTrack("Coding")
                        .skillLevel("Intermediate")
                        .onboardingCompleted(true)
                        .build());

        mockMvc.perform(get("/api/users/me/preferences").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goal").value("Interview Prep"))
                .andExpect(jsonPath("$.preferredTrack").value("Coding"));
    }

    @Test
    void shouldUpdatePreferences() throws Exception {
        when(userPreferenceService.updatePreferences(eq(USER_ID), any()))
                .thenReturn(UserPreferenceResponse.builder()
                        .userId(USER_ID.toString())
                        .goal("Skill Improvement")
                        .preferredTrack("Both")
                        .skillLevel("Beginner")
                        .onboardingCompleted(true)
                        .build());

        String payload = """
                {
                  "goal": "Skill Improvement",
                  "preferredTrack": "Both",
                  "skillLevel": "Beginner"
                }
                """;

        mockMvc.perform(put("/api/users/me/preferences")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredTrack").value("Both"))
                .andExpect(jsonPath("$.onboardingCompleted").value(true));
    }

    @Test
    void shouldRejectInvalidPreferences() throws Exception {
        String payload = """
                {
                  "goal": "Invalid Goal",
                  "preferredTrack": "Nope",
                  "skillLevel": "Expert"
                }
                """;

        mockMvc.perform(put("/api/users/me/preferences")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldGetDashboardSummary() throws Exception {
        when(userProfileService.getDashboardSummary(eq(USER_ID), eq("ROLE_USER")))
                .thenReturn(DashboardSummaryResponse.builder()
                        .userId(USER_ID.toString())
                        .displayName("User Demo")
                        .role("ROLE_USER")
                        .onboardingCompleted(true)
                        .goal("Interview Prep")
                        .preferredTrack("Coding")
                        .skillLevel("Intermediate")
                        .recommendations(List.of(
                                RecommendationCardResponse.builder()
                                        .title("Strengthen Arrays")
                                        .description("Review a weaker coding topic.")
                                        .route("/problems")
                                        .reason("Weak coding topic")
                                        .priority("MEDIUM")
                                        .build()
                        ))
                        .recommendedFirstAction(DashboardSummaryResponse.RecommendedAction.builder()
                                .title("Solve your first coding problem")
                                .description("Start coding practice aligned to your current goal and level.")
                                .route("/problems")
                                .build())
                        .checklist(List.of())
                        .build());

        mockMvc.perform(get("/api/users/me/dashboard-summary").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendedFirstAction.route").value("/problems"))
                .andExpect(jsonPath("$.preferredTrack").value("Coding"));
    }

    @Test
    void shouldGetAnalytics() throws Exception {
        when(userAnalyticsService.getAnalytics(eq(USER_ID), eq("ROLE_USER")))
                .thenReturn(UserAnalyticsResponse.builder()
                        .recommendations(List.of(
                                RecommendationCardResponse.builder()
                                        .title("Join a study plan")
                                        .route("/study-plans")
                                        .build()
                        ))
                        .build());

        mockMvc.perform(get("/api/users/me/analytics").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recommendations[0].route").value("/study-plans"));
    }

    @Test
    void shouldIngestProductEvent() throws Exception {
        when(productEventService.ingest(eq(USER_ID), eq("ROLE_USER"), any()))
                .thenReturn(ProductEventResponse.builder()
                        .id(99L)
                        .eventName("AUTH_LOGIN_SUCCESS")
                        .eventCategory("AUTH")
                        .accepted(true)
                        .build());

        String payload = """
                {
                  "eventName": "auth.login_success",
                  "eventCategory": "AUTH",
                  "source": "WEB"
                }
                """;

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/users/events")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted").value(true))
                .andExpect(jsonPath("$.eventName").value("AUTH_LOGIN_SUCCESS"));
    }

    @Test
    void shouldRejectInvalidEventPayload() throws Exception {
        String payload = """
                {
                  "eventName": "",
                  "eventCategory": ""
                }
                """;

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/users/events")
                        .principal(authentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectInvalidAdminStudyPlanPayload() throws Exception {
        String payload = """
                {
                  "slug":"",
                  "title":"",
                  "description":"Bad request",
                  "track":"",
                  "level":"",
                  "active":true,
                  "items":[]
                }
                """;

        mockMvc.perform(post("/api/users/admin/study-plans")
                        .principal(new UsernamePasswordAuthenticationToken(
                                USER_ID,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }
}
