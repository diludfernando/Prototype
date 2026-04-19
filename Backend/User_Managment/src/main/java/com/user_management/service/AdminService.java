package com.user_management.service;

import com.user_management.dto.request.CreateCounselorRequest;
import com.user_management.dto.request.UpdateUserRequest;
import com.user_management.dto.response.UserResponse;
import com.user_management.entity.CounselorProfile;
import com.user_management.entity.StudentProfile;
import com.user_management.entity.User;
import com.user_management.enums.Role;
import com.user_management.repository.CounselorProfileRepository;
import com.user_management.repository.StudentProfileRepository;
import com.user_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CounselorProfileRepository counselorProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return mapToDetailedUserResponse(user);
    }

    @Transactional
    public UserResponse createCounselor(CreateCounselorRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create counselor user
        User counselor = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getTempPassword()))
                .role(Role.COUNSELOR)
                .enabled(true)
                .build();

        counselor = userRepository.save(counselor);

        // Create counselor profile with required mandatory fields
        CounselorProfile counselorProfile = CounselorProfile.builder()
                .user(counselor)
                .fullName(request.getFullName())
                .phoneNumber("0000000000") // Placeholder - to be updated by counselor
                .qualification("Pending") // To be updated by counselor
                .specialization("Pending") // To be updated by counselor
                .yearsOfExperience(0) // To be updated by counselor
                .shortBio("Profile pending completion") // To be updated by counselor
                .build();

        counselorProfileRepository.save(counselorProfile);

        return mapToUserResponse(counselor);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Prevent disabling admin accounts
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot disable admin accounts");
        }

        // Toggle the enabled status
        user.setEnabled(!user.getEnabled());
        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Prevent deleting admin accounts
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin accounts");
        }

        if (user.getEnabled()) {
            throw new RuntimeException("Only disabled users can be deleted");
        }

        studentProfileRepository.deleteByUserId(userId);
        counselorProfileRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getRole() != null && !request.getRole().isBlank()) {
            throw new RuntimeException("Changing user role is not allowed");
        }

        String trimmedEmail = request.getEmail() != null ? request.getEmail().trim() : null;
        String trimmedFullName = request.getFullName() != null ? request.getFullName().trim() : null;
        String trimmedPhoneNumber = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null;
        String newPassword = request.getNewPassword() != null ? request.getNewPassword().trim() : null;

        if (trimmedEmail != null && !trimmedEmail.isEmpty()) {
            if (!user.getEmail().equals(trimmedEmail) && userRepository.existsByEmail(trimmedEmail)) {
                throw new RuntimeException("Email already registered");
            }
            user.setEmail(trimmedEmail);
        }

        if (user.getRole() == Role.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));

            if (trimmedFullName != null && !trimmedFullName.isEmpty()) {
                profile.setFullName(trimmedFullName);
            }
            if (trimmedPhoneNumber != null && !trimmedPhoneNumber.isEmpty()) {
                profile.setPhone(trimmedPhoneNumber);
            }

            studentProfileRepository.save(profile);
        }

        if (user.getRole() == Role.COUNSELOR) {
            CounselorProfile profile = counselorProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Counselor profile not found"));

            if (trimmedFullName != null && !trimmedFullName.isEmpty()) {
                profile.setFullName(trimmedFullName);
            }
            if (trimmedPhoneNumber != null && !trimmedPhoneNumber.isEmpty()) {
                profile.setPhoneNumber(trimmedPhoneNumber);
            }

            counselorProfileRepository.save(profile);
        }

        if (newPassword != null && !newPassword.isEmpty()) {
            if (user.getRole() != Role.ADMIN) {
                throw new RuntimeException("Password reset from this edit flow is allowed only for admin account");
            }
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserResponse mapToDetailedUserResponse(User user) {
        UserResponse response = mapToUserResponse(user);
        response.setDetails(extractUserDetails(user));
        return response;
    }

    private Map<String, Object> extractUserDetails(User user) {
        Map<String, Object> details = new LinkedHashMap<>();

        if (user.getRole() == Role.STUDENT) {
            StudentProfile profile = user.getStudentProfile();
            if (profile != null) {
                details.put("fullName", profile.getFullName());
                details.put("phone", profile.getPhone());
                details.put("university", profile.getUniversity());
                details.put("degreeProgram", profile.getDegreeProgram());
                details.put("yearLevel", profile.getYearLevel());
                details.put("selectedCareerPath", profile.getSelectedCareerPath());
                details.put("careerGoals", profile.getCareerGoals());
                details.put("skills", profile.getSkills());
                details.put("interests", profile.getInterests());
                details.put("about", profile.getAbout());
                details.put("gpa", profile.getGpa());
                details.put("linkedinUrl", profile.getLinkedinUrl());
                details.put("githubUrl", profile.getGithubUrl());
            }
        }

        if (user.getRole() == Role.COUNSELOR) {
            CounselorProfile profile = user.getCounselorProfile();
            if (profile != null) {
                details.put("fullName", profile.getFullName());
                details.put("phoneNumber", profile.getPhoneNumber());
                details.put("qualification", profile.getQualification());
                details.put("specialization", profile.getSpecialization());
                details.put("yearsOfExperience", profile.getYearsOfExperience());
                details.put("shortBio", profile.getShortBio());
                details.put("linkedinUrl", profile.getLinkedinUrl());
            }
        }

        return details;
    }
}
