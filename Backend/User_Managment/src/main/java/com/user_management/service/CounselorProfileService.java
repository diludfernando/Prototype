package com.user_management.service;

import com.user_management.dto.request.CounselorProfileUpdateRequest;
import com.user_management.dto.request.MandatoryCounselorProfileRequest;
import com.user_management.dto.response.CounselorProfileResponse;
import com.user_management.entity.CounselorProfile;
import com.user_management.entity.User;
import com.user_management.repository.CounselorProfileRepository;
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
public class CounselorProfileService {

    private final CounselorProfileRepository counselorProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CounselorProfileResponse getMyProfile() {
        Long userId = getCurrentUserId();
        CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Counselor profile not found"));

        return mapToResponse(profile);
    }

    @Transactional
    public CounselorProfileResponse updateMyProfile(CounselorProfileUpdateRequest request) {
        Long userId = getCurrentUserId();
        CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Counselor profile not found"));

        // Update fields if provided
        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getQualification() != null) {
            profile.setQualification(request.getQualification());
        }
        if (request.getSpecialization() != null) {
            profile.setSpecialization(request.getSpecialization());
        }
        if (request.getYearsOfExperience() != null) {
            profile.setYearsOfExperience(request.getYearsOfExperience());
        }
        if (request.getShortBio() != null) {
            profile.setShortBio(request.getShortBio());
        }
        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(request.getProfileImageUrl());
        }

        profile = counselorProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public CounselorProfileResponse completeMandatoryProfile(MandatoryCounselorProfileRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Check if profile already exists
        CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                .orElse(null);

        if (profile == null) {
            // Create new profile
            profile = CounselorProfile.builder()
                    .user(user)
                    .fullName(request.getFullName())
                    .phoneNumber(request.getPhoneNumber())
                    .qualification(request.getQualification())
                    .specialization(request.getSpecialization())
                    .yearsOfExperience(request.getYearsOfExperience())
                    .shortBio(request.getShortBio())
                    .build();
        } else {
            // Update existing profile
            profile.setFullName(request.getFullName());
            profile.setPhoneNumber(request.getPhoneNumber());
            profile.setQualification(request.getQualification());
            profile.setSpecialization(request.getSpecialization());
            profile.setYearsOfExperience(request.getYearsOfExperience());
            profile.setShortBio(request.getShortBio());
        }

        // Update user password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        profile = counselorProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    public boolean isMandatoryProfileComplete() {
        Long userId = getCurrentUserId();
        CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                .orElse(null);

        if (profile == null) {
            return false;
        }

        // Check for placeholder values used during admin creation
        boolean hasPlaceholderPhone = "0000000000".equals(profile.getPhoneNumber());
        boolean hasPlaceholderQualification = "Pending".equals(profile.getQualification());
        boolean hasPlaceholderSpecialization = "Pending".equals(profile.getSpecialization());
        boolean hasPlaceholderBio = "Profile pending completion".equals(profile.getShortBio());

        // If any placeholder values exist, profile is not complete
        if (hasPlaceholderPhone || hasPlaceholderQualification ||
                hasPlaceholderSpecialization || hasPlaceholderBio) {
            return false;
        }

        return profile.getFullName() != null && !profile.getFullName().isEmpty() &&
                profile.getPhoneNumber() != null && !profile.getPhoneNumber().isEmpty() &&
                profile.getQualification() != null && !profile.getQualification().isEmpty() &&
                profile.getSpecialization() != null && !profile.getSpecialization().isEmpty() &&
                profile.getYearsOfExperience() != null &&
                profile.getShortBio() != null && !profile.getShortBio().isEmpty();
    }

    private CounselorProfileResponse mapToResponse(CounselorProfile profile) {
        return CounselorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .phoneNumber(profile.getPhoneNumber())
                .qualification(profile.getQualification())
                .specialization(profile.getSpecialization())
                .yearsOfExperience(profile.getYearsOfExperience())
                .shortBio(profile.getShortBio())
                .linkedinUrl(profile.getLinkedinUrl())
                .profileImageUrl(profile.getProfileImageUrl())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }
}
