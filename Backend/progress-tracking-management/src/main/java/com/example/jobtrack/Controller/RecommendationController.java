package com.example.jobtrack.Controller;

import com.example.jobtrack.Dto.JobRecommendationDto;
import com.example.jobtrack.service.JobRecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class RecommendationController {

    private final JobRecommendationService service;

    public RecommendationController(JobRecommendationService service) {
        this.service = service;
    }

    @GetMapping("/jobs/{userId}")
    public List<JobRecommendationDto> recommendJobs(@PathVariable Long userId,
            @RequestParam(defaultValue = "6") int top) {
        return service.recommendJobs(userId, top);
    }
}