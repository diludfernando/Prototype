package com.user_management.dto.request;

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
    private String phone;

    @Size(max = 150, message = "University name cannot exceed 150 characters")
    private String university;

    @Size(max = 100, message = "Degree program cannot exceed 100 characters")
    private String degreeProgram;

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

    private Double gpa;

    @Size(max = 200, message = "LinkedIn URL cannot exceed 200 characters")
    private String linkedinUrl;

    @Size(max = 200, message = "GitHub URL cannot exceed 200 characters")
    private String githubUrl;

    @Size(max = 300, message = "Profile image URL cannot exceed 300 characters")
    private String profileImageUrl;
}
