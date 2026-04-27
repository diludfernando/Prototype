package com.example.jobtrack.service;

import com.example.jobtrack.Dto.ReadinessResponseDto;
import com.example.jobtrack.Dto.SkillMatchDto;
import com.example.jobtrack.model.CareerSkill;
import com.example.jobtrack.model.UserSkill;
import com.example.jobtrack.repository.CareerSkillRepository;
import com.example.jobtrack.repository.UserRepository;
import com.example.jobtrack.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReadinessService {

    private final CareerSkillRepository careerSkillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;

    public ReadinessService(CareerSkillRepository careerSkillRepository,
            UserSkillRepository userSkillRepository, UserRepository userRepository) {
        this.careerSkillRepository = careerSkillRepository;
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
    }

    // ✅ returns BOTH total score + per-skill breakdown
    public ReadinessResponseDto calculateReadinessWithBreakdown(Long userId, Long careerId) {

        List<CareerSkill> required = careerSkillRepository.findByCareerId(careerId);
        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);

        if (required.isEmpty()) {
            return new ReadinessResponseDto(userId, careerId, 0.0, Collections.emptyList());
        }

        Map<Long, Integer> userMap = new HashMap<>();
        for (UserSkill us : userSkills) {
            userMap.put(us.getSkillId(), us.getCurrentLevel());
        }

        List<SkillMatchDto> breakdown = new ArrayList<>();
        double totalRatio = 0.0;

        for (CareerSkill req : required) {
            int reqLevel = req.getRequiredLevel();
            int userLevel = userMap.getOrDefault(req.getSkillId(), 0);

            double ratio = (reqLevel == 0) ? 0.0 : ((double) userLevel / reqLevel);
            if (ratio > 1)
                ratio = 1;

            double matchPercent = Math.round(ratio * 10000.0) / 100.0; // 2 decimals

            breakdown.add(new SkillMatchDto(
                    req.getSkillId(),
                    reqLevel,
                    userLevel,
                    matchPercent));

            totalRatio += ratio;
        }

        double avgPercent = (totalRatio / required.size()) * 100.0;
        avgPercent = Math.round(avgPercent * 100.0) / 100.0;

        ReadinessResponseDto response = new ReadinessResponseDto(userId, careerId, avgPercent, breakdown);
        
        // Use the unified score if available, otherwise fallback to skill match score
        com.example.jobtrack.model.User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getOverallReadinessScore() != null && user.getOverallReadinessScore() > 0) {
            response.setCareerReadinessScore(user.getOverallReadinessScore());
        } else {
            response.setCareerReadinessScore(avgPercent);
        }
        
        return response;
    }

    public double calculateUnifiedScore(Long userId, double skillMatchScore) {
        com.example.jobtrack.model.User user = userRepository.findById(userId).orElse(null);
        if (user == null) return skillMatchScore;

        // Assessment Progress (0-100) from the user's saved stats. Let's calculate an average if overall is not available.
        // Assuming easy (0-20), medium (0-40), hard (0-40) adds up to 100.
        double assessmentProgress = (user.getAssessmentEasy() != null ? user.getAssessmentEasy() : 0) +
                                    (user.getAssessmentMedium() != null ? user.getAssessmentMedium() : 0) +
                                    (user.getAssessmentHard() != null ? user.getAssessmentHard() : 0);

        // Courses Completed (each course could be worth something, let's say max out at 5 courses = 100%)
        int courses = user.getCoursesCompleted() != null ? user.getCoursesCompleted() : 0;
        double coursesProgress = Math.min((courses / 5.0) * 100.0, 100.0);

        // For Leaderboard Strength, we approximate it using the skillMatchScore itself for now, 
        // as a true relative rank requires calculating everyone else's score first.
        double leaderboardStrength = skillMatchScore;

        double unifiedScore = (assessmentProgress * 0.45) + (coursesProgress * 0.35) + (leaderboardStrength * 0.2);
        
        // Save to user
        user.setOverallReadinessScore(Math.round(unifiedScore * 100.0) / 100.0);
        userRepository.save(user);

        return user.getOverallReadinessScore();
    }

    // keep your old method if you want
    public double calculateReadiness(Long userId, Long careerId) {
        return calculateReadinessWithBreakdown(userId, careerId).getSkillMatchScore();
    }
}
