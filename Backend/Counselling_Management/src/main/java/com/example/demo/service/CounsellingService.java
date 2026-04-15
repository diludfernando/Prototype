package com.example.demo.service;

import com.example.demo.dto.EligibilityResponse;
import com.example.demo.model.CounsellingSession;
import com.example.demo.model.PaymentStatus;
import com.example.demo.model.SessionStatus;
import com.example.demo.repository.CounsellingSessionRepository;
import com.example.demo.repository.CounsellorRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CounsellingService {

    private final CounsellingSessionRepository sessionRepository;
    private final CounsellorRepository counsellorRepository;
    private final JdbcTemplate jdbcTemplate;

    public CounsellingService(CounsellingSessionRepository sessionRepository,
            CounsellorRepository counsellorRepository,
            JdbcTemplate jdbcTemplate) {
        this.sessionRepository = sessionRepository;
        this.counsellorRepository = counsellorRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public CounsellingSession bookSession(CounsellingSession session) {
        validateRequiredFields(session);

        counsellorRepository.findById(session.getCounsellorId()).ifPresent(c -> {
            session.setCounsellorName(c.getName());
        });

        // Edge case: prevent booking past dates.
        if (session.getSessionDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("sessionDate cannot be in the past.");
        }

        // Edge case: prevent duplicate bookings (same student + same date/time slot).
        boolean duplicateExists = sessionRepository.existsByStudentIdAndSessionDateAndTimeSlot(
                session.getStudentId(),
                session.getSessionDate(),
                session.getTimeSlot());
        if (duplicateExists) {
            throw new IllegalArgumentException("Duplicate booking is not allowed for the selected student and time.");
        }

        // Set server-side defaults.
        if (Boolean.TRUE.equals(session.getIsFree())) {
            session.setPaymentStatus(PaymentStatus.FREE);
        } else {
            session.setPaymentStatus(PaymentStatus.PENDING);
        }

        if (session.getStatus() == null) {
            session.setStatus(SessionStatus.BOOKED);
        }

        return sessionRepository.save(session);
    }

    public boolean isFirstTimeUser(Long studentId) {
        return !sessionRepository.existsByStudentId(studentId);
    }

    public EligibilityResponse getEligibility(Long studentId) {
        boolean isFirstTime = isFirstTimeUser(studentId);
        
        // Check Hard Test Status
        Boolean passedHardTest = false;
        try {
            passedHardTest = jdbcTemplate.queryForObject(
                "SELECT cleared_hardest_level FROM user_hard_test_status WHERE student_id = ?",
                Boolean.class,
                studentId
            );
        } catch (Exception e) {
            // If user not in table, default to false
            passedHardTest = false;
        }

        // Check Course Count
        Integer courseCount = 0;
        try {
            courseCount = jdbcTemplate.queryForObject(
                "SELECT completed_courses FROM user_course_count WHERE student_id = ?",
                Integer.class,
                studentId
            );
        } catch (Exception e) {
            // If user not in table, default to 0
            courseCount = 0;
        }

        return new EligibilityResponse(
            isFirstTime,
            Boolean.TRUE.equals(passedHardTest),
            courseCount != null && courseCount >= 5
        );
    }

    private void validateRequiredFields(CounsellingSession session) {
        if (session == null) {
            throw new IllegalArgumentException("Request body is required.");
        }
        if (session.getStudentId() == null) {
            throw new IllegalArgumentException("studentId is required.");
        }
        if (session.getCounsellorId() == null) {
            throw new IllegalArgumentException("counsellorId is required.");
        }
        if (session.getSessionDate() == null) {
            throw new IllegalArgumentException("sessionDate is required.");
        }
        if (session.getTimeSlot() == null || session.getTimeSlot().trim().isEmpty()) {
            throw new IllegalArgumentException("timeSlot is required.");
        }
        if (session.getIsFree() == null) {
            throw new IllegalArgumentException("isFree is required.");
        }

        // Normalize time slot so duplicate checks remain consistent.
        session.setTimeSlot(session.getTimeSlot().trim());
    }
}
