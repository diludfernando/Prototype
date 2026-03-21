package com.example.jobtrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "career_skills")
public class CareerSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "career_id")
    private Long careerId;

    @Column(name = "skill_id")
    private Long skillId;

    @Column(name = "required_level")
    private Integer requiredLevel;

    public CareerSkill() {}

    public CareerSkill(Long careerId, Long skillId, Integer requiredLevel) {
        this.careerId = careerId;
        this.skillId = skillId;
        this.requiredLevel = requiredLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCareerId() { return careerId; }
    public void setCareerId(Long careerId) { this.careerId = careerId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }
}