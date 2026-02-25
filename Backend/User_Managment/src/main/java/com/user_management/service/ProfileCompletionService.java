package com.user_management.service;

import com.user_management.entity.StudentProfile;
import org.springframework.stereotype.Service;

@Service
public class ProfileCompletionService {

    public double calculateCompletion(StudentProfile profile) {
        int totalFields = 11; // Total fields we consider for completion
        int completedFields = 0;

        if (isNotEmpty(profile.getFullName()))
            completedFields++;
        if (isNotEmpty(profile.getPhone()))
            completedFields++;
        if (isNotEmpty(profile.getUniversity()))
            completedFields++;
        if (isNotEmpty(profile.getDegreeProgram()))
            completedFields++;
        if (profile.getYearLevel() != null)
            completedFields++;
        if (isNotEmpty(profile.getSelectedCareerPath()))
            completedFields++;
        if (isNotEmpty(profile.getCareerGoals()))
            completedFields++;
        if (isNotEmpty(profile.getInterests()))
            completedFields++;
        if (isNotEmpty(profile.getAbout()))
            completedFields++;
        if (isNotEmpty(profile.getLinkedinUrl()))
            completedFields++;
        if (isNotEmpty(profile.getGithubUrl()))
            completedFields++;

        return ((double) completedFields / totalFields) * 100;
    }

    private boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
