package com.example.jobtrack.repository;

import com.example.jobtrack.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
}