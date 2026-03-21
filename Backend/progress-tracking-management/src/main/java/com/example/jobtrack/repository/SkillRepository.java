package com.example.jobtrack.repository;

import com.example.jobtrack.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}