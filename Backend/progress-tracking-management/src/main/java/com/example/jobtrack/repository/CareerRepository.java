package com.example.jobtrack.repository;

import com.example.jobtrack.model.Career;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareerRepository extends JpaRepository<Career, Long> {
}
