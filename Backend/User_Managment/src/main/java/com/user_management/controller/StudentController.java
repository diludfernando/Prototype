package com.user_management.controller;

import com.user_management.dto.request.MandatoryProfileRequest;
import com.user_management.dto.request.StudentProfileUpdateRequest;
import com.user_management.dto.response.ApiResponse;
import com.user_management.dto.response.ProfileCompletionResponse;
import com.user_management.dto.response.StudentProfileResponse;
import com.user_management.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentProfileService studentProfileService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getProfile() {
        try {
            StudentProfileResponse response = studentProfileService.getMyProfile();
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateProfile(
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        try {
            StudentProfileResponse response = studentProfileService.updateMyProfile(request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> patchProfile(
            @Valid @RequestBody StudentProfileUpdateRequest request) {
        try {
            StudentProfileResponse response = studentProfileService.updateMyProfile(request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/profile/completion")
    public ResponseEntity<ApiResponse<ProfileCompletionResponse>> getProfileCompletion() {
        try {
            ProfileCompletionResponse response = studentProfileService.getProfileCompletion();
            return ResponseEntity.ok(ApiResponse.success("Profile completion retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/profile/complete-mandatory")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> completeMandatoryProfile(
            @Valid @RequestBody MandatoryProfileRequest request) {
        try {
            StudentProfileResponse response = studentProfileService.completeMandatoryProfile(request);
            return ResponseEntity.ok(ApiResponse.success("Mandatory profile completed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/profile/check-mandatory")
    public ResponseEntity<ApiResponse<Boolean>> checkMandatoryProfile() {
        try {
            boolean isComplete = studentProfileService.isMandatoryProfileComplete();
            return ResponseEntity.ok(ApiResponse.success("Mandatory profile status checked", isComplete));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
