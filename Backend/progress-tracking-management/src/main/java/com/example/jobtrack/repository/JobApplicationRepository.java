package com.example.jobtrack.repository;

import com.example.jobtrack.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserIdOrderByAppliedAtDesc(Long userId);
}