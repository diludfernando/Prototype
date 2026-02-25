package com.user_management.controller;

import com.user_management.dto.request.CounselorProfileUpdateRequest;
import com.user_management.dto.request.MandatoryCounselorProfileRequest;
import com.user_management.dto.response.ApiResponse;
import com.user_management.dto.response.CounselorProfileResponse;
import com.user_management.service.CounselorProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/counselor")
@PreAuthorize("hasRole('COUNSELOR')")
@RequiredArgsConstructor
public class CounselorController {

    private final CounselorProfileService counselorProfileService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<String>> getDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success("Counselor dashboard accessed", "Welcome to Counselor Dashboard"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CounselorProfileResponse>> getMyProfile() {
        try {
            CounselorProfileResponse response = counselorProfileService.getMyProfile();
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CounselorProfileResponse>> updateMyProfile(
            @Valid @RequestBody CounselorProfileUpdateRequest request) {
        try {
            CounselorProfileResponse response = counselorProfileService.updateMyProfile(request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/profile/complete-mandatory")
    public ResponseEntity<ApiResponse<CounselorProfileResponse>> completeMandatoryProfile(
            @Valid @RequestBody MandatoryCounselorProfileRequest request) {
        try {
            CounselorProfileResponse response = counselorProfileService.completeMandatoryProfile(request);
            return ResponseEntity.ok(ApiResponse.success("Mandatory profile completed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/profile/check-mandatory")
    public ResponseEntity<ApiResponse<Boolean>> checkMandatoryProfile() {
        try {
            boolean isComplete = counselorProfileService.isMandatoryProfileComplete();
            return ResponseEntity.ok(ApiResponse.success("Mandatory profile status checked", isComplete));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
