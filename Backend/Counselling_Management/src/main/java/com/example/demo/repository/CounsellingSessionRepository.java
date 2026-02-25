package com.example.demo.repository;

import com.example.demo.model.CounsellingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CounsellingSessionRepository extends JpaRepository<CounsellingSession, Long> {
}
