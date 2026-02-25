package com.user_management.service;

import com.user_management.dto.request.LoginRequest;
import com.user_management.dto.request.RegisterRequest;
import com.user_management.dto.response.LoginResponse;
import com.user_management.entity.StudentProfile;
import com.user_management.entity.User;
import com.user_management.enums.Role;
import com.user_management.repository.StudentProfileRepository;
import com.user_management.repository.UserRepository;
import com.user_management.security.CustomUserDetails;
import com.user_management.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;

        @Transactional
        public LoginResponse register(RegisterRequest request) {
                // Check if email already exists
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already registered");
                }

                // Create user
                User user = User.builder()
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(Role.STUDENT)
                                .enabled(true)
                                .build();

                user = userRepository.save(user);

                // Create student profile with basic info
                StudentProfile profile = StudentProfile.builder()
                                .user(user)
                                .fullName(request.getFullName())
                                .university(request.getUniversity())
                                .degreeProgram(request.getDegreeProgram())
                                .yearLevel(request.getYearLevel())
                                .selectedCareerPath(request.getSelectedCareerPath())
                                .build();

                studentProfileRepository.save(profile);

                // Generate JWT token
                String token = jwtUtil.generateTokenFromEmail(user.getEmail());

                return LoginResponse.builder()
                                .token(token)
                                .tokenType("Bearer")
                                .userId(user.getId())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .expiresIn(jwtUtil.getJwtExpirationMs())
                                .expiryTime(LocalDateTime.now().plusSeconds(jwtUtil.getJwtExpirationMs() / 1000))
                                .build();
        }

        public LoginResponse login(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String token = jwtUtil.generateToken(authentication);

                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

                return LoginResponse.builder()
                                .token(token)
                                .tokenType("Bearer")
                                .userId(userDetails.getId())
                                .email(userDetails.getEmail())
                                .role(userDetails.getRole())
                                .expiresIn(jwtUtil.getJwtExpirationMs())
                                .expiryTime(LocalDateTime.now().plusSeconds(jwtUtil.getJwtExpirationMs() / 1000))
                                .build();
        }
}
