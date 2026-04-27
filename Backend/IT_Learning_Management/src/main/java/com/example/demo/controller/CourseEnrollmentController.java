package com.example.demo.controller;

import com.example.demo.database.entity.CourseEnrollment;
import com.example.demo.database.repository.CourseEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class CourseEnrollmentController {

    @Autowired
    private CourseEnrollmentRepository repository;

    @GetMapping("/user/{userId}")
    public List<CourseEnrollment> getEnrollmentsByUserId(@PathVariable Long userId) {
        return repository.findByUserId(userId);
    }

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<Map<String, Object>> getEnrollmentSummaryByUserId(@PathVariable Long userId) {
        List<CourseEnrollment> enrollments = repository.findByUserId(userId);
        long completedCount = enrollments.stream()
                .filter(e -> (e.getProgress() != null && e.getProgress() >= 100) || 
                             (e.getCompleted() != null && e.getCompleted() > 0) ||
                             ("Purchased Externally".equals(e.getEnrollmentType()) && "APPROVED".equals(e.getVerificationStatus())))
                .count();
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "completedCount", completedCount,
                "totalEnrollments", enrollments.size()
        ));
    }

    @GetMapping("/pending")
    public List<CourseEnrollment> getPendingVerifications() {
        return repository.findByVerificationStatus("PENDING");
    }

    @GetMapping("/all")
    public List<CourseEnrollment> getAllEnrollments() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody CourseEnrollment enrollment) {
        if ("Purchased Externally".equals(enrollment.getEnrollmentType())) {
            if (enrollment.getPurchaseProofUrl() == null || !enrollment.getPurchaseProofUrl().startsWith("http")) {
                return ResponseEntity.badRequest().body("Invalid certificate URL");
            }
            enrollment.setVerificationStatus("PENDING");
        } else {
            enrollment.setVerificationStatus("APPROVED");
        }
        return ResponseEntity.ok(repository.save(enrollment));
    }

    @PutMapping("/{id}")
    public CourseEnrollment updateProgress(@PathVariable Long id, @RequestBody CourseEnrollment enrollment) {
        return repository.save(enrollment);
    }

    // Admin: approve or reject a purchase
    @PatchMapping("/{id}/verify")
    public ResponseEntity<?> verifyEnrollment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<CourseEnrollment> opt = repository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        String status = body.get("status"); // "APPROVED" or "REJECTED"
        if (!List.of("APPROVED", "REJECTED").contains(status)) {
            return ResponseEntity.badRequest().body("Status must be APPROVED or REJECTED");
        }

        CourseEnrollment enrollment = opt.get();
        enrollment.setVerificationStatus(status);
        return ResponseEntity.ok(repository.save(enrollment));
    }
}
