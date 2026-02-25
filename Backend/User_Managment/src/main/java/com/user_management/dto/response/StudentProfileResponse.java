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
public class StudentProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String phone;
    private String university;
    private String degreeProgram;
    private Integer yearLevel;
    private String selectedCareerPath;
    private String careerGoals;
    private String skills;
    private String interests;
    private String about;
    private Double gpa;
    private String linkedinUrl;
    private String githubUrl;
    private String profileImageUrl;
    private LocalDateTime updatedAt;
    private Double completionPercentage;
}
