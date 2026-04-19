package com.user_management.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
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
public class UpdateUserRequest {
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    @Pattern(regexp = "^$|^(?:\\+94|94|0)[1-9][0-9]{8}$", message = "Enter a valid Sri Lankan phone number")
    private String phoneNumber;

    @Pattern(regexp = "^(?i)(STUDENT|COUNSELOR|ADMIN)$", message = "Role must be STUDENT, COUNSELOR, or ADMIN")
    private String role;

    @Pattern(regexp = "^$|^.{6,100}$", message = "Password must be between 6 and 100 characters")
    private String newPassword;

    private String confirmPassword;

    @AssertTrue(message = "Password confirmation does not match")
    public boolean isPasswordMatching() {
        if (newPassword == null || newPassword.isBlank()) {
            return true;
        }
        return newPassword.equals(confirmPassword);
    }
}
