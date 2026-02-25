package com.user_management.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MandatoryCounselorProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phoneNumber;

    @NotBlank(message = "Qualification is required")
    @Size(max = 200, message = "Qualification cannot exceed 200 characters")
    private String qualification;

    @NotBlank(message = "Specialization is required")
    @Size(max = 200, message = "Specialization cannot exceed 200 characters")
    private String specialization;

    @NotNull(message = "Years of experience is required")
    @Min(value = 0, message = "Years of experience must be at least 0")
    @Max(value = 50, message = "Years of experience cannot exceed 50")
    private Integer yearsOfExperience;

    @NotBlank(message = "Short bio is required")
    @Size(max = 1000, message = "Short bio cannot exceed 1000 characters")
    private String shortBio;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String newPassword;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;
}
