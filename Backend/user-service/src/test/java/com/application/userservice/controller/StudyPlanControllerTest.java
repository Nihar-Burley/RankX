package com.application.userservice.controller;

import com.application.userservice.dto.AdminStudyPlanRequest;
import com.application.userservice.dto.AdminStudyPlanResponse;
import com.application.userservice.dto.ProgressSummaryResponse;
import com.application.userservice.dto.StudyPlanDetailResponse;
import com.application.userservice.dto.StudyPlanProgressResponse;
import com.application.userservice.dto.StudyPlanResponse;
import com.application.userservice.dto.UserStudyPlanResponse;
import com.application.userservice.service.StudyPlanService;
import com.application.userservice.service.ProductEventService;
import com.application.userservice.service.UserAnalyticsService;
import com.application.userservice.service.UserPreferenceService;
import com.application.userservice.service.UserProfileService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudyPlanControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

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

    private Authentication adminAuthentication() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }

    @Test
    void shouldListStudyPlans() throws Exception {
        when(studyPlanService.getStudyPlans(USER_ID)).thenReturn(List.of(
                StudyPlanResponse.builder()
                        .id(1L)
                        .slug("dsa-basics")
                        .title("DSA Basics")
                        .description("Foundational plan")
                        .track("Coding")
                        .level("Beginner")
                        .totalItems(3)
                        .enrolled(false)
                        .build()
        ));

        mockMvc.perform(get("/api/users/study-plans").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("DSA Basics"))
                .andExpect(jsonPath("$[0].totalItems").value(3));
    }

    @Test
    void shouldGetStudyPlanDetail() throws Exception {
        when(studyPlanService.getStudyPlanDetail(USER_ID, 1L)).thenReturn(
                StudyPlanDetailResponse.builder()
                        .id(1L)
                        .slug("dsa-basics")
                        .title("DSA Basics")
                        .description("Foundational plan")
                        .track("Coding")
                        .level("Beginner")
                        .enrolled(true)
                        .items(List.of(
                                StudyPlanDetailResponse.StudyPlanItemResponse.builder()
                                        .id(11L)
                                        .sequenceNumber(1)
                                        .title("Arrays warmup")
                                        .description("Solve first array challenge")
                                        .itemType("CODING_PROBLEM")
                                        .referenceKey("problem-101")
                                        .estimatedMinutes(30)
                                        .progressState("NEXT")
                                        .build()
                        ))
                        .build()
        );

        mockMvc.perform(get("/api/users/study-plans/1").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrolled").value(true))
                .andExpect(jsonPath("$.items[0].title").value("Arrays warmup"));
    }

    @Test
    void shouldEnrollInStudyPlan() throws Exception {
        when(studyPlanService.enroll(USER_ID, 1L)).thenReturn(
                UserStudyPlanResponse.builder()
                        .studyPlanId(1L)
                        .title("DSA Basics")
                        .track("Coding")
                        .level("Beginner")
                        .enrolledAt(LocalDateTime.now())
                        .completionPercentage(0.0)
                        .nextItemTitle("Arrays warmup")
                        .build()
        );

        mockMvc.perform(post("/api/users/study-plans/1/enroll").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studyPlanId").value(1))
                .andExpect(jsonPath("$.nextItemTitle").value("Arrays warmup"));
    }

    @Test
    void shouldGetUserStudyPlans() throws Exception {
        when(studyPlanService.getUserStudyPlans(USER_ID)).thenReturn(List.of(
                UserStudyPlanResponse.builder()
                        .studyPlanId(1L)
                        .title("DSA Basics")
                        .track("Coding")
                        .level("Beginner")
                        .enrolledAt(LocalDateTime.now())
                        .completionPercentage(0.0)
                        .nextItemTitle("Arrays warmup")
                        .build()
        ));

        mockMvc.perform(get("/api/users/me/study-plans").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studyPlanId").value(1))
                .andExpect(jsonPath("$[0].title").value("DSA Basics"));
    }

    @Test
    void shouldGetStudyPlanProgress() throws Exception {
        when(studyPlanService.getStudyPlanProgress(USER_ID, 1L)).thenReturn(
                StudyPlanProgressResponse.builder()
                        .studyPlanId(1L)
                        .title("DSA Basics")
                        .completionPercentage(50.0)
                        .totalItems(2)
                        .completedItems(1)
                        .nextItemTitle("Java basics quiz")
                        .items(List.of(
                                StudyPlanProgressResponse.ItemProgress.builder()
                                        .itemId(11L)
                                        .sequenceNumber(1)
                                        .title("Arrays warmup")
                                        .itemType("CODING_PROBLEM")
                                        .referenceKey("problem-101")
                                        .completed(true)
                                        .progressState("COMPLETED")
                                        .build()
                        ))
                        .build()
        );

        mockMvc.perform(get("/api/users/me/study-plans/1/progress").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedItems").value(1))
                .andExpect(jsonPath("$.nextItemTitle").value("Java basics quiz"))
                .andExpect(jsonPath("$.items[0].progressState").value("COMPLETED"));
    }

    @Test
    void shouldGetProgressSummary() throws Exception {
        when(studyPlanService.getProgressSummary(eq(USER_ID))).thenReturn(
                ProgressSummaryResponse.builder()
                        .enrolledPlans(2)
                        .streakCount(5)
                        .currentPlan(ProgressSummaryResponse.CurrentPlan.builder()
                                .studyPlanId(1L)
                                .title("DSA Basics")
                                .completionPercentage(40.0)
                                .nextItemTitle("Arrays warmup")
                                .build())
                        .build()
        );

        mockMvc.perform(get("/api/users/me/progress-summary").principal(authentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enrolledPlans").value(2))
                .andExpect(jsonPath("$.streakCount").value(5))
                .andExpect(jsonPath("$.currentPlan.title").value("DSA Basics"));
    }

    @Test
    void adminShouldListStudyPlans() throws Exception {
        when(studyPlanService.getAdminStudyPlans()).thenReturn(List.of(
                AdminStudyPlanResponse.builder()
                        .id(1L)
                        .slug("mixed-foundations")
                        .title("Mixed Foundations")
                        .description("Blend tracks")
                        .track("Both")
                        .level("Intermediate")
                        .active(true)
                        .totalItems(2)
                        .items(List.of())
                        .build()
        ));

        mockMvc.perform(get("/api/users/admin/study-plans").principal(adminAuthentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("mixed-foundations"));
    }

    @Test
    void adminShouldCreateStudyPlan() throws Exception {
        when(studyPlanService.createStudyPlan(org.mockito.ArgumentMatchers.any(AdminStudyPlanRequest.class))).thenReturn(
                AdminStudyPlanResponse.builder()
                        .id(5L)
                        .slug("mixed-foundations")
                        .title("Mixed Foundations")
                        .description("Blend tracks")
                        .track("Both")
                        .level("Intermediate")
                        .active(true)
                        .totalItems(2)
                        .items(List.of())
                        .build()
        );

        mockMvc.perform(post("/api/users/admin/study-plans")
                        .principal(adminAuthentication())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "slug":"mixed-foundations",
                                  "title":"Mixed Foundations",
                                  "description":"Blend tracks",
                                  "track":"Both",
                                  "level":"Intermediate",
                                  "active":true,
                                  "items":[
                                    {
                                      "sequenceNumber":1,
                                      "title":"Arrays warmup",
                                      "description":"Solve a warmup",
                                      "itemType":"CODING_PROBLEM",
                                      "referenceType":"problem",
                                      "referenceId":"101",
                                      "estimatedMinutes":20
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.title").value("Mixed Foundations"));
    }

    @Test
    void adminShouldDeactivateStudyPlan() throws Exception {
        when(studyPlanService.deactivateStudyPlan(1L)).thenReturn(
                AdminStudyPlanResponse.builder()
                        .id(1L)
                        .slug("mixed-foundations")
                        .title("Mixed Foundations")
                        .description("Blend tracks")
                        .track("Both")
                        .level("Intermediate")
                        .active(false)
                        .totalItems(2)
                        .items(List.of())
                        .build()
        );

        mockMvc.perform(put("/api/users/admin/study-plans/1/deactivate").principal(adminAuthentication()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }
}
