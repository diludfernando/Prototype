package com.example.jobtrack.Dto;

import java.util.List;

public class ReadinessResponseDto {

    private Long userId;
    private Long careerId;

    // Skill-only match score (0-100)
    private double skillMatchScore;

    // NEW: assessment average (0-100)
    private double assessmentAvg;

    // NEW: final career readiness (0-100)
    private double careerReadinessScore;

    private List<SkillMatchDto> breakdown;

    public ReadinessResponseDto() {}

    public ReadinessResponseDto(Long userId, Long careerId, double skillMatchScore, List<SkillMatchDto> breakdown) {
        this.userId = userId;
        this.careerId = careerId;
        this.skillMatchScore = skillMatchScore;
        this.breakdown = breakdown;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCareerId() { return careerId; }
    public void setCareerId(Long careerId) { this.careerId = careerId; }

    public double getSkillMatchScore() { return skillMatchScore; }
    public void setSkillMatchScore(double skillMatchScore) { this.skillMatchScore = skillMatchScore; }

    public double getAssessmentAvg() { return assessmentAvg; }
    public void setAssessmentAvg(double assessmentAvg) { this.assessmentAvg = assessmentAvg; }

    public double getCareerReadinessScore() { return careerReadinessScore; }
    public void setCareerReadinessScore(double careerReadinessScore) { this.careerReadinessScore = careerReadinessScore; }

    public List<SkillMatchDto> getBreakdown() { return breakdown; }
    public void setBreakdown(List<SkillMatchDto> breakdown) { this.breakdown = breakdown; }
}