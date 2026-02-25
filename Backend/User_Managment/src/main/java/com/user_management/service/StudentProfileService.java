package com.user_management.service;

import com.user_management.dto.request.MandatoryProfileRequest;
import com.user_management.dto.request.StudentProfileUpdateRequest;
import com.user_management.dto.response.ProfileCompletionResponse;
import com.user_management.dto.response.StudentProfileResponse;
import com.user_management.entity.StudentProfile;
import com.user_management.repository.StudentProfileRepository;
import com.user_management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final ProfileCompletionService profileCompletionService;

    public StudentProfileResponse getMyProfile() {
        Long userId = getCurrentUserId();
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        return mapToResponse(profile);
    }

    @Transactional
    public StudentProfileResponse updateMyProfile(StudentProfileUpdateRequest request) {
        Long userId = getCurrentUserId();
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        // Update fields if provided
        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getUniversity() != null) {
            profile.setUniversity(request.getUniversity());
        }
        if (request.getDegreeProgram() != null) {
            profile.setDegreeProgram(request.getDegreeProgram());
        }
        if (request.getYearLevel() != null) {
            profile.setYearLevel(request.getYearLevel());
        }
        if (request.getSelectedCareerPath() != null) {
            profile.setSelectedCareerPath(request.getSelectedCareerPath());
        }
        if (request.getCareerGoals() != null) {
            profile.setCareerGoals(request.getCareerGoals());
        }
        if (request.getSkills() != null) {
            profile.setSkills(request.getSkills());
        }
        if (request.getInterests() != null) {
            profile.setInterests(request.getInterests());
        }
        if (request.getAbout() != null) {
            profile.setAbout(request.getAbout());
        }
        if (request.getGpa() != null) {
            profile.setGpa(request.getGpa());
        }
        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getGithubUrl() != null) {
            profile.setGithubUrl(request.getGithubUrl());
        }
        if (request.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(request.getProfileImageUrl());
        }

        profile = studentProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    public ProfileCompletionResponse getProfileCompletion() {
        Long userId = getCurrentUserId();
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        double completion = profileCompletionService.calculateCompletion(profile);

        return ProfileCompletionResponse.builder()
                .completionPercentage(completion)
                .totalFields(11)
                .completedFields((int) Math.round(completion * 11 / 100))
                .build();
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        double completion = profileCompletionService.calculateCompletion(profile);

        return StudentProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .university(profile.getUniversity())
                .degreeProgram(profile.getDegreeProgram())
                .yearLevel(profile.getYearLevel())
                .selectedCareerPath(profile.getSelectedCareerPath())
                .careerGoals(profile.getCareerGoals())
                .skills(profile.getSkills())
                .interests(profile.getInterests())
                .about(profile.getAbout())
                .gpa(profile.getGpa())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .profileImageUrl(profile.getProfileImageUrl())
                .updatedAt(profile.getUpdatedAt())
                .completionPercentage(completion)
                .build();
    }

    @Transactional
    public StudentProfileResponse completeMandatoryProfile(MandatoryProfileRequest request) {
        Long userId = getCurrentUserId();
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        // Update mandatory fields
        profile.setUniversity(request.getUniversity());
        profile.setDegreeProgram(request.getDegreeProgram());
        profile.setYearLevel(request.getYearLevel());
        profile.setCareerGoals(request.getCareerGoals());
        profile.setSkills(request.getSkills());
        profile.setInterests(request.getInterests());
        profile.setPhone(request.getPhone());

        profile = studentProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    public boolean isMandatoryProfileComplete() {
        Long userId = getCurrentUserId();
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        return profile.getUniversity() != null && !profile.getUniversity().isEmpty() &&
                profile.getDegreeProgram() != null && !profile.getDegreeProgram().isEmpty() &&
                profile.getYearLevel() != null &&
                profile.getCareerGoals() != null && !profile.getCareerGoals().isEmpty() &&
                profile.getSkills() != null && !profile.getSkills().isEmpty() &&
                profile.getInterests() != null && !profile.getInterests().isEmpty() &&
                profile.getPhone() != null && !profile.getPhone().isEmpty();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }
}
