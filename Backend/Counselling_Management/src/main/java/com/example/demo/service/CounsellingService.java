package com.example.demo.service;

import com.example.demo.model.CounsellingSession;
import com.example.demo.model.PaymentStatus;
import com.example.demo.model.SessionStatus;
import com.example.demo.repository.CounsellingSessionRepository;
import com.example.demo.repository.CounsellorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class CounsellingService {

    private final CounsellingSessionRepository sessionRepository;
    private final CounsellorRepository counsellorRepository;

    public CounsellingService(CounsellingSessionRepository sessionRepository, CounsellorRepository counsellorRepository) {
        this.sessionRepository = sessionRepository;
        this.counsellorRepository = counsellorRepository;
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
                session.getTimeSlot()
        );
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

