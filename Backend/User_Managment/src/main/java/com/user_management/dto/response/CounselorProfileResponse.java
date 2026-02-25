package com.user_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselorProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String qualification;
    private String specialization;
    private Integer yearsOfExperience;
    private String shortBio;
    private String linkedinUrl;
    private String profileImageUrl;
    private LocalDateTime updatedAt;
}
