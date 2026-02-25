package com.example.demo.Controller;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/counselling")
@CrossOrigin
public class CounsellingController {

    private final CounsellorRepository counsellorRepository;
    private final CounsellingSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;
    private final SessionNoteRepository sessionNoteRepository;

    public CounsellingController(CounsellorRepository counsellorRepository,
            CounsellingSessionRepository sessionRepository,
            PaymentRepository paymentRepository,
            SessionNoteRepository sessionNoteRepository) {
        this.counsellorRepository = counsellorRepository;
        this.sessionRepository = sessionRepository;
        this.paymentRepository = paymentRepository;
        this.sessionNoteRepository = sessionNoteRepository;
    }

    @GetMapping("/")
    public ResponseEntity<String> welcome() {
        return ResponseEntity
                .ok("Welcome to the Premium IT Career Counselling Service API! The service is running on Port 8083.");
    }

    @PostMapping("/book")
    public ResponseEntity<CounsellingSession> bookSession(@RequestBody CounsellingSession session) {
        if (session.getIsFree() != null && session.getIsFree()) {
            session.setPaymentStatus(PaymentStatus.FREE);
        } else {
            session.setPaymentStatus(PaymentStatus.PENDING);
        }
        if (session.getStatus() == null) {
            session.setStatus(SessionStatus.BOOKED);
        }
        CounsellingSession savedSession = sessionRepository.save(session);
        return ResponseEntity.ok(savedSession);
    }

    @PostMapping("/pay/{sessionId}")
    public ResponseEntity<?> simulatePayment(@PathVariable Long sessionId,
            @RequestBody PaymentRequest paymentRequest) {

        // Validations
        Map<String, String> errors = new HashMap<>();

        if (paymentRequest.getCardNumber() == null || !Pattern.matches("\\d{16}", paymentRequest.getCardNumber())) {
            errors.put("cardNumber", "Card number must be exactly 16 digits.");
        }
        if (paymentRequest.getCvv() == null || !Pattern.matches("\\d{3}", paymentRequest.getCvv())) {
            errors.put("cvv", "CVV must be exactly 3 digits.");
        }
        if (paymentRequest.getExpiry() == null
                || !Pattern.matches("(0[1-9]|1[0-2])/\\d{2}", paymentRequest.getExpiry())) {
            errors.put("expiry", "Expiry must be in MM/YY format.");
        }
        if (paymentRequest.getCardHolder() == null || paymentRequest.getCardHolder().trim().isEmpty()) {
            errors.put("cardHolder", "Card holder name is required.");
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // Validate Session exists
        Optional<CounsellingSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CounsellingSession session = sessionOpt.get();
        if (session.getPaymentStatus() == PaymentStatus.PAID) {
            return ResponseEntity.badRequest().body(Map.of("message", "Session is already paid."));
        }

        session.setPaymentStatus(PaymentStatus.PAID);
        sessionRepository.save(session);

        // Process Mock Payment
        String last4 = paymentRequest.getCardNumber().substring(12);

        Payment payment = new Payment();
        payment.setSessionId(sessionId);
        payment.setAmount(new BigDecimal("100.00")); // Hardcoded amount or pass from request
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(PaymentStatus.PAID);
        payment.setLastFourDigits(last4);

        Payment savedPayment = paymentRepository.save(payment);
        return ResponseEntity.ok(savedPayment);
    }

    @GetMapping("/all")
    public ResponseEntity<List<CounsellingSession>> getAllSessions() {
        return ResponseEntity.ok(sessionRepository.findAll());
    }

    @PostMapping("/note/{sessionId}")
    public ResponseEntity<SessionNote> addSessionNote(@PathVariable Long sessionId, @RequestBody SessionNote note) {
        Optional<CounsellingSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        note.setSessionId(sessionId);
        SessionNote savedNote = sessionNoteRepository.save(note);
        return ResponseEntity.ok(savedNote);
    }

    @PutMapping("/update-status/{sessionId}")
    public ResponseEntity<CounsellingSession> updateSessionStatus(@PathVariable Long sessionId,
            @RequestParam SessionStatus status) {
        Optional<CounsellingSession> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CounsellingSession session = sessionOpt.get();
        session.setStatus(status);
        CounsellingSession updatedSession = sessionRepository.save(session);
        return ResponseEntity.ok(updatedSession);
    }
}
