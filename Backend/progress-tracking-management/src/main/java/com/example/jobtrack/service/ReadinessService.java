package com.example.jobtrack.service;

import com.example.jobtrack.Dto.ReadinessResponseDto;
import com.example.jobtrack.Dto.SkillMatchDto;
import com.example.jobtrack.model.CareerSkill;
import com.example.jobtrack.model.UserSkill;
import com.example.jobtrack.repository.CareerSkillRepository;
import com.example.jobtrack.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReadinessService {

    private final CareerSkillRepository careerSkillRepository;
    private final UserSkillRepository userSkillRepository;

    public ReadinessService(CareerSkillRepository careerSkillRepository,
            UserSkillRepository userSkillRepository) {
        this.careerSkillRepository = careerSkillRepository;
        this.userSkillRepository = userSkillRepository;
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

        return new ReadinessResponseDto(userId, careerId, avgPercent, breakdown);
    }

    // keep your old method if you want
    public double calculateReadiness(Long userId, Long careerId) {
        return calculateReadinessWithBreakdown(userId, careerId).getSkillMatchScore();
    }
}