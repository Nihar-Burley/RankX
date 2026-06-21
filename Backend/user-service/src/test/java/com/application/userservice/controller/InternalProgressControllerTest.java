package com.application.userservice.controller;

import com.application.userservice.dto.ActivityProgressUpdateRequest;
import com.application.userservice.dto.ActivityProgressUpdateResponse;
import com.application.userservice.service.StudyPlanService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InternalProgressController.class)
@AutoConfigureMockMvc(addFilters = false)
class InternalProgressControllerTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudyPlanService studyPlanService;

    private Authentication authentication() {
        return new UsernamePasswordAuthenticationToken(
                USER_ID,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    void shouldUpdateActivityCompletion() throws Exception {
        when(studyPlanService.markActivityCompleted(eq(USER_ID), any(ActivityProgressUpdateRequest.class)))
                .thenReturn(ActivityProgressUpdateResponse.builder()
                        .progressChanged(true)
                        .affectedStudyPlans(1)
                        .completedItems(1)
                        .build());

        String payload = objectMapper.writeValueAsString(ActivityProgressUpdateRequest.builder()
                .itemType("CODING_PROBLEM")
                .referenceKey("problem-101")
                .sourceEventId("submission-44")
                .build());

        mockMvc.perform(post("/api/users/internal/progress/activity-completions")
                        .principal(authentication())
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progressChanged").value(true))
                .andExpect(jsonPath("$.affectedStudyPlans").value(1));
    }

    @Test
    void shouldRejectInvalidActivityCompletionPayload() throws Exception {
        String payload = """
                {
                  "itemType": "",
                  "referenceKey": "",
                  "sourceEventId": ""
                }
                """;

        mockMvc.perform(post("/api/users/internal/progress/activity-completions")
                        .principal(authentication())
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }
}
