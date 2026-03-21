package com.example.jobtrack.Dto;

public class SkillMatchDto {
    private Long skillId;
    private int requiredLevel;
    private int userLevel;
    private double matchPercent; // 0-100

    public SkillMatchDto() {}

    public SkillMatchDto(Long skillId, int requiredLevel, int userLevel, double matchPercent) {
        this.skillId = skillId;
        this.requiredLevel = requiredLevel;
        this.userLevel = userLevel;
        this.matchPercent = matchPercent;
    }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public int getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(int requiredLevel) { this.requiredLevel = requiredLevel; }

    public int getUserLevel() { return userLevel; }
    public void setUserLevel(int userLevel) { this.userLevel = userLevel; }

    public double getMatchPercent() { return matchPercent; }
    public void setMatchPercent(double matchPercent) { this.matchPercent = matchPercent; }
}
