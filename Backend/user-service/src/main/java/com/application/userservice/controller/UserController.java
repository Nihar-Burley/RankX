package com.application.userservice.controller;

import com.application.userservice.dto.AdminStudyPlanRequest;
import com.application.userservice.dto.AdminStudyPlanResponse;
import com.application.userservice.dto.DashboardSummaryResponse;
import com.application.userservice.dto.ProductEventRequest;
import com.application.userservice.dto.ProductEventResponse;
import com.application.userservice.dto.ProgressSummaryResponse;
import com.application.userservice.dto.StudyPlanDetailResponse;
import com.application.userservice.dto.StudyPlanProgressResponse;
import com.application.userservice.dto.StudyPlanResponse;
import com.application.userservice.dto.UserAnalyticsResponse;
import com.application.userservice.dto.UserPreferenceRequest;
import com.application.userservice.dto.UserPreferenceResponse;
import com.application.userservice.dto.UserProfileResponse;
import com.application.userservice.dto.UserStudyPlanResponse;
import com.application.userservice.service.StudyPlanService;
import com.application.userservice.service.ProductEventService;
import com.application.userservice.service.UserAnalyticsService;
import com.application.userservice.service.UserPreferenceService;
import com.application.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;
    private final UserPreferenceService userPreferenceService;
    private final StudyPlanService studyPlanService;
    private final UserAnalyticsService userAnalyticsService;
    private final ProductEventService productEventService;

    public UserController(
            UserProfileService userProfileService,
            UserPreferenceService userPreferenceService,
            StudyPlanService studyPlanService,
            UserAnalyticsService userAnalyticsService,
            ProductEventService productEventService
    ) {
        this.userProfileService = userProfileService;
        this.userPreferenceService = userPreferenceService;
        this.studyPlanService = studyPlanService;
        this.userAnalyticsService = userAnalyticsService;
        this.productEventService = productEventService;
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        UUID userId = getUserId(authentication);
        String role = getRole(authentication);

        return ResponseEntity.ok(userProfileService.getProfile(userId, role));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/preferences")
    public ResponseEntity<UserPreferenceResponse> getMyPreferences(Authentication authentication) {
        return ResponseEntity.ok(userPreferenceService.getPreferences(getUserId(authentication)));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/me/preferences")
    public ResponseEntity<UserPreferenceResponse> updateMyPreferences(
            Authentication authentication,
            @Valid @RequestBody UserPreferenceRequest request
    ) {
        return ResponseEntity.ok(userPreferenceService.updatePreferences(getUserId(authentication), request));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/dashboard-summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(Authentication authentication) {
        return ResponseEntity.ok(userProfileService.getDashboardSummary(
                getUserId(authentication),
                getRole(authentication)
        ));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/analytics")
    public ResponseEntity<UserAnalyticsResponse> getMyAnalytics(Authentication authentication) {
        return ResponseEntity.ok(userAnalyticsService.getAnalytics(
                getUserId(authentication),
                getRole(authentication)
        ));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/events")
    public ResponseEntity<ProductEventResponse> ingestEvent(
            Authentication authentication,
            @Valid @RequestBody ProductEventRequest request
    ) {
        return ResponseEntity.ok(productEventService.ingest(
                getUserId(authentication),
                getRole(authentication),
                request
        ));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/study-plans")
    public ResponseEntity<List<StudyPlanResponse>> getStudyPlans(Authentication authentication) {
        return ResponseEntity.ok(studyPlanService.getStudyPlans(getUserId(authentication)));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/study-plans/{id}")
    public ResponseEntity<StudyPlanDetailResponse> getStudyPlanDetail(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(studyPlanService.getStudyPlanDetail(getUserId(authentication), id));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/study-plans/{id}/enroll")
    public ResponseEntity<UserStudyPlanResponse> enrollInStudyPlan(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(studyPlanService.enroll(getUserId(authentication), id));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/study-plans")
    public ResponseEntity<List<UserStudyPlanResponse>> getMyStudyPlans(Authentication authentication) {
        return ResponseEntity.ok(studyPlanService.getUserStudyPlans(getUserId(authentication)));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/study-plans/{id}/progress")
    public ResponseEntity<StudyPlanProgressResponse> getMyStudyPlanProgress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(studyPlanService.getStudyPlanProgress(getUserId(authentication), id));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/me/progress-summary")
    public ResponseEntity<ProgressSummaryResponse> getMyProgressSummary(Authentication authentication) {
        return ResponseEntity.ok(studyPlanService.getProgressSummary(getUserId(authentication)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/study-plans")
    public ResponseEntity<List<AdminStudyPlanResponse>> getAdminStudyPlans() {
        return ResponseEntity.ok(studyPlanService.getAdminStudyPlans());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/study-plans/{id}")
    public ResponseEntity<AdminStudyPlanResponse> getAdminStudyPlan(@PathVariable Long id) {
        return ResponseEntity.ok(studyPlanService.getAdminStudyPlan(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/study-plans")
    public ResponseEntity<AdminStudyPlanResponse> createAdminStudyPlan(
            @Valid @RequestBody AdminStudyPlanRequest request
    ) {
        return ResponseEntity.ok(studyPlanService.createStudyPlan(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/study-plans/{id}")
    public ResponseEntity<AdminStudyPlanResponse> updateAdminStudyPlan(
            @PathVariable Long id,
            @Valid @RequestBody AdminStudyPlanRequest request
    ) {
        return ResponseEntity.ok(studyPlanService.updateStudyPlan(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/study-plans/{id}/deactivate")
    public ResponseEntity<AdminStudyPlanResponse> deactivateAdminStudyPlan(@PathVariable Long id) {
        return ResponseEntity.ok(studyPlanService.deactivateStudyPlan(id));
    }

    private UUID getUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    private String getRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("ROLE_USER");
    }
}
