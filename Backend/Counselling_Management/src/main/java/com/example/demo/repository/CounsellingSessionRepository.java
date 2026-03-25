package com.example.demo.repository;

import com.example.demo.model.CounsellingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CounsellingSessionRepository extends JpaRepository<CounsellingSession, Long> {

    boolean existsByStudentIdAndSessionDateAndTimeSlot(Long studentId, LocalDate sessionDate, String timeSlot);

    List<CounsellingSession> findByStudentId(Long studentId);
}
