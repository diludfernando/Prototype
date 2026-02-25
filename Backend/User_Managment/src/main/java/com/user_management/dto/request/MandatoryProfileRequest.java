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
public class MandatoryProfileRequest {

    @NotBlank(message = "University is required")
    @Size(max = 150, message = "University name cannot exceed 150 characters")
    private String university;

    @NotBlank(message = "Degree program is required")
    @Size(max = 100, message = "Degree program cannot exceed 100 characters")
    private String degreeProgram;

    @NotNull(message = "Year level is required")
    @Min(value = 1, message = "Year level must be at least 1")
    @Max(value = 7, message = "Year level cannot exceed 7")
    private Integer yearLevel;

    @NotBlank(message = "Career goals are required")
    @Size(max = 500, message = "Career goals cannot exceed 500 characters")
    private String careerGoals;

    @NotBlank(message = "Skills are required")
    @Size(max = 1000, message = "Skills cannot exceed 1000 characters")
    private String skills;

    @NotBlank(message = "Interests are required")
    @Size(max = 500, message = "Interests cannot exceed 500 characters")
    private String interests;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;
}
