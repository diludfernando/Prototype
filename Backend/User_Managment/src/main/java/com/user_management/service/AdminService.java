package com.user_management.service;

import com.user_management.dto.request.CreateCounselorRequest;
import com.user_management.dto.request.UpdateUserRequest;
import com.user_management.dto.response.UserResponse;
import com.user_management.entity.CounselorProfile;
import com.user_management.entity.User;
import com.user_management.enums.Role;
import com.user_management.repository.CounselorProfileRepository;
import com.user_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CounselorProfileRepository counselorProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return mapToUserResponse(user);
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

        userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role provided");
            }
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
}
