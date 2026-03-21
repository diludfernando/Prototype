package com.example.jobtrack.repository;

import com.example.jobtrack.model.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {
    List<JobSkill> findByJob_Id(Long jobId);
}