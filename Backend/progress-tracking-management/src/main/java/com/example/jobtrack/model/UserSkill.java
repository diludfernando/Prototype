package com.example.jobtrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_skills")
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "skill_id")
    private Long skillId;

    @Column(name = "current_level")
    private Integer currentLevel;

    public UserSkill() {}

    public UserSkill(Long userId, Long skillId, Integer currentLevel) {
        this.userId = userId;
        this.skillId = skillId;
        this.currentLevel = currentLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
}