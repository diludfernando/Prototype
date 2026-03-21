package com.example.jobtrack.repository;

import com.example.jobtrack.model.UserAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAssessmentRepository extends JpaRepository<UserAssessment, Long> {
    List<UserAssessment> findByUserId(Long userId);
}