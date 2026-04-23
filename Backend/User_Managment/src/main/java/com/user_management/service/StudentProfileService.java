package com.user_management.service;

import com.user_management.dto.request.MandatoryProfileRequest;
import com.user_management.dto.request.StudentDeactivateAccountRequest;
import com.user_management.dto.request.StudentPasswordResetRequest;
import com.user_management.dto.request.StudentProfileUpdateRequest;
import com.user_management.dto.response.ProfileCompletionResponse;
import com.user_management.dto.response.StudentProfileResponse;
import com.user_management.entity.StudentProfile;
import com.user_management.entity.User;
import com.user_management.enums.Role;
import com.user_management.repository.StudentProfileRepository;
import com.user_management.repository.UserRepository;
import com.user_management.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final ProfileCompletionService profileCompletionService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        profile.setGpa(request.getGpa());
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

    @Transactional
    public void resetPassword(StudentPasswordResetRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deactivateMyAccount(StudentDeactivateAccountRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only student accounts can be deactivated here");
        }

        if (!user.getEnabled()) {
            throw new RuntimeException("Account is already deactivated");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }
}
