package com.example.jobtrack.repository;

import com.example.jobtrack.model.CareerSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareerSkillRepository extends JpaRepository<CareerSkill, Long> {
    List<CareerSkill> findByCareerId(Long careerId);
}