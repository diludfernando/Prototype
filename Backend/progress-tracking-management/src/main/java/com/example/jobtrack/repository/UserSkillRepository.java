package com.example.jobtrack.repository;

import com.example.jobtrack.model.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserId(Long userId);

    void deleteByUserId(Long userId);

}