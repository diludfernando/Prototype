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
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Size(max = 150, message = "University name cannot exceed 150 characters")
    private String university;

    @Size(max = 100, message = "Degree program cannot exceed 100 characters")
    private String degreeProgram;

    @Min(value = 1, message = "Year level must be at least 1")
    @Max(value = 7, message = "Year level cannot exceed 7")
    private Integer yearLevel;

    @NotBlank(message = "Selected career path is required")
    @Size(max = 100, message = "Selected career path cannot exceed 100 characters")
    private String selectedCareerPath;
}
