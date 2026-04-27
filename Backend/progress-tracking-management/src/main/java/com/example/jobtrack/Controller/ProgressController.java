package com.example.jobtrack.Controller;

import com.example.jobtrack.model.Skill;
import com.example.jobtrack.model.User;
import com.example.jobtrack.model.UserSkill;
import com.example.jobtrack.repository.SkillRepository;
import com.example.jobtrack.repository.UserRepository;
import com.example.jobtrack.repository.UserSkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.example.jobtrack.service.ReadinessService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:5173" })
public class ProgressController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final RestTemplate restTemplate;
    private final ReadinessService readinessService;

    public ProgressController(UserRepository userRepository,
                              SkillRepository skillRepository,
                              UserSkillRepository userSkillRepository,
                              RestTemplate restTemplate,
                              ReadinessService readinessService) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.restTemplate = restTemplate;
        this.readinessService = readinessService;
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncUserSkills(@RequestParam String username) {
        try {
            // Find user by email or name
            User user = userRepository.findByEmail(username);
            if (user == null) {
                user = userRepository.findByName(username);
            }
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            // 1. Fetch skill ratings from progress service (8082)
            String url = "http://localhost:8082/api/skill-ratings?username=" + username;
            try {
                ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    List<Map<String, Object>> ratings = response.getBody();
                    userSkillRepository.deleteByUserId(user.getId());
                    for (Map<String, Object> rating : ratings) {
                        String category = (String) rating.get("category");
                        Double average = ((Number) rating.get("average")).doubleValue();
                        Skill skill = skillRepository.findBySkillName(category);
                        if (skill != null) {
                            int currentLevel = (int) Math.round(average / 20.0);
                            UserSkill userSkill = new UserSkill(user.getId(), skill.getId(), currentLevel);
                            userSkillRepository.save(userSkill);
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("Failed to fetch skill ratings: " + e.getMessage());
            }

            // 2. Fetch User Progress for assessment stats (8082)
            String progressUrl = "http://localhost:8082/api/progress?username=" + username;
            try {
                ResponseEntity<Map> progressResponse = restTemplate.getForEntity(progressUrl, Map.class);
                if (progressResponse.getStatusCode().is2xxSuccessful() && progressResponse.getBody() != null) {
                    Map<String, Object> progress = progressResponse.getBody();
                    if (progress.get("easy") != null) user.setAssessmentEasy(((Number) progress.get("easy")).intValue());
                    if (progress.get("medium") != null) user.setAssessmentMedium(((Number) progress.get("medium")).intValue());
                    if (progress.get("hard") != null) user.setAssessmentHard(((Number) progress.get("hard")).intValue());
                }
            } catch (Exception e) {
                System.out.println("Failed to fetch user progress: " + e.getMessage());
            }

            // 3. Fetch Course Enrollment Summary (8084)
            String enrollmentUrl = "http://localhost:8084/api/enrollments/user/" + user.getId() + "/summary";
            try {
                ResponseEntity<Map> enrollmentResponse = restTemplate.getForEntity(enrollmentUrl, Map.class);
                if (enrollmentResponse.getStatusCode().is2xxSuccessful() && enrollmentResponse.getBody() != null) {
                    Map<String, Object> summary = enrollmentResponse.getBody();
                    if (summary.get("completedCount") != null) {
                        user.setCoursesCompleted(((Number) summary.get("completedCount")).intValue());
                    }
                }
            } catch (Exception e) {
                System.out.println("Failed to fetch enrollments: " + e.getMessage());
            }
            
            userRepository.save(user);

            // 4. Recalculate unified score (assuming an average skill match score of 50% for leaderboard proxy if not specific to career)
            // The true score is updated when calculateReadinessWithBreakdown is called, but we do a baseline sync here.
            readinessService.calculateUnifiedScore(user.getId(), 50.0);

            return ResponseEntity.ok("User skills synced successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Sync failed: " + e.getMessage());
        }
    }
}
