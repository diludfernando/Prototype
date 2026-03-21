package com.example.jobtrack.Controller;

import com.example.jobtrack.Dto.ReadinessResponseDto;
import com.example.jobtrack.service.ReadinessService;
import org.springframework.web.bind.annotation.*;
import com.example.jobtrack.model.UserAssessment;
import com.example.jobtrack.repository.UserAssessmentRepository;

@RestController
@RequestMapping("/api/readiness")
@CrossOrigin
public class ReadinessController {

    private final ReadinessService readinessService;

    public ReadinessController(ReadinessService readinessService) {
        this.readinessService = readinessService;
    }

    // existing simple endpoint
    @GetMapping("/{userId}/{careerId}")
    public ReadinessResponseDto getReadiness(@PathVariable Long userId, @PathVariable Long careerId) {
        return readinessService.calculateReadinessWithBreakdown(userId, careerId);
    }
}