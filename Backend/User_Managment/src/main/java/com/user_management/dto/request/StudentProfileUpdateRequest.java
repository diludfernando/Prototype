package com.user_management.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileUpdateRequest {

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    @Pattern(regexp = "^$|^\\+?[0-9]{10,15}$", message = "Phone number must be 10-15 digits and can start with +")
    private String phone;

    @Size(max = 150, message = "University name cannot exceed 150 characters")
    private String university;

    @Size(max = 100, message = "Degree program cannot exceed 100 characters")
    private String degreeProgram;

    @Min(value = 1, message = "Year level must be at least 1")
    @Max(value = 7, message = "Year level cannot exceed 7")
    private Integer yearLevel;

    @Size(max = 100, message = "Selected career path cannot exceed 100 characters")
    private String selectedCareerPath;

    @Size(max = 500, message = "Career goals cannot exceed 500 characters")
    private String careerGoals;

    @Size(max = 1000, message = "Skills cannot exceed 1000 characters")
    private String skills;

    @Size(max = 500, message = "Interests cannot exceed 500 characters")
    private String interests;

    @Size(max = 1000, message = "About section cannot exceed 1000 characters")
    private String about;

    @DecimalMin(value = "0.0", message = "GPA must be at least 0.0")
    @DecimalMax(value = "4.0", message = "GPA cannot exceed 4.0")
    private Double gpa;

    @Size(max = 200, message = "LinkedIn URL cannot exceed 200 characters")
    @Pattern(regexp = "^$|^(https?://)?(www\\.)?linkedin\\.com/.*$", message = "LinkedIn URL must be a valid linkedin.com link")
    private String linkedinUrl;

    @Size(max = 200, message = "GitHub URL cannot exceed 200 characters")
    @Pattern(regexp = "^$|^(https?://)?(www\\.)?github\\.com/.*$", message = "GitHub URL must be a valid github.com link")
    private String githubUrl;

    private String profileImageUrl;
}
