package com.example.jobtrack.Controller;

import com.example.jobtrack.Dto.ReadinessResponseDto;
import com.example.jobtrack.model.User;
import com.example.jobtrack.repository.UserRepository;
import com.example.jobtrack.service.ReadinessService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin
public class LeaderboardController {

    private final UserRepository userRepository;
    private final ReadinessService readinessService;

    public LeaderboardController(UserRepository userRepository, ReadinessService readinessService) {
        this.userRepository = userRepository;
        this.readinessService = readinessService;
    }

    // Example: /api/leaderboard/career/1?top=10
    @GetMapping("/career/{careerId}")
    public List<Map<String, Object>> leaderboard(@PathVariable Long careerId,
            @RequestParam(defaultValue = "10") int top) {

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        for (User u : users) {
            ReadinessResponseDto dto = readinessService.calculateReadinessWithBreakdown(u.getId(), careerId);

            Map<String, Object> row = new HashMap<>();
            row.put("userId", u.getId());
            row.put("name", u.getName());
            row.put("careerId", careerId);
            row.put("careerReadinessScore", dto.getCareerReadinessScore());
            results.add(row);
        }

        results.sort((a, b) -> Double.compare(
                (double) b.get("careerReadinessScore"),
                (double) a.get("careerReadinessScore")));

        if (top < results.size())
            return results.subList(0, top);
        return results;
    }
}