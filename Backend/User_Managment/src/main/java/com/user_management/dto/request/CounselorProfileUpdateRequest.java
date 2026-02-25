package com.user_management.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselorProfileUpdateRequest {

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phoneNumber;

    @Size(max = 200, message = "Qualification cannot exceed 200 characters")
    private String qualification;

    @Size(max = 200, message = "Specialization cannot exceed 200 characters")
    private String specialization;

    @Min(value = 0, message = "Years of experience must be at least 0")
    @Max(value = 50, message = "Years of experience cannot exceed 50")
    private Integer yearsOfExperience;

    @Size(max = 1000, message = "Short bio cannot exceed 1000 characters")
    private String shortBio;

    @Size(max = 200, message = "LinkedIn URL cannot exceed 200 characters")
    private String linkedinUrl;

    @Size(max = 300, message = "Profile image URL cannot exceed 300 characters")
    private String profileImageUrl;
}
