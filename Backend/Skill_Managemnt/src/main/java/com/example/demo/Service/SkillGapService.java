package com.example.demo.Service;

import com.example.demo.Model.QuizResult;
import com.example.demo.Dto.JobDto;
import com.example.demo.Dto.JobRequirementDto;
import com.example.demo.Dto.SkillGapAnalysisResultDto;
import com.example.demo.Dto.SkillGapResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.*;

@Service
public class SkillGapService {

    @Autowired
    private QuizResultService quizResultService;

    private final RestTemplate restTemplate = new RestTemplate();

    public SkillGapResponseDto analyzeSkillGap(String username, String jobTitle) {
        // 1. Fetch user quiz results
        List<QuizResult> userResults = quizResultService.getResultsByUsername(username);

        // Map highest rating for each category
        Map<String, Integer> userSkillMap = new HashMap<>();
        for (QuizResult result : userResults) {
            String category = result.getCategory();
            int rating = result.getRating();
            if (!userSkillMap.containsKey(category) || rating > userSkillMap.get(category)) {
                userSkillMap.put(category, rating);
            }
        }

        // 2. Fetch Job Details from progress-tracking-management
        String jobsUrl = "http://localhost:8085/api/jobs";
        ResponseEntity<List<JobDto>> response = restTemplate.exchange(
            jobsUrl,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<JobDto>>() {}
        );

        List<JobDto> allJobs = response.getBody();
        if (allJobs == null) return null;

        JobDto targetJob = allJobs.stream()
                .filter(job -> job.getTitle().equalsIgnoreCase(jobTitle))
                .findFirst()
                .orElse(null);

        if (targetJob == null) return null;

        // 3. Compare requirements with user skills
        List<SkillGapAnalysisResultDto> gapResults = new ArrayList<>();
        int matchedCount = 0;

        for (JobRequirementDto req : targetJob.getRequirements()) {
            String language = req.getLanguage();
            String requiredLevelStr = req.getLevel();
            int requiredLevel = mapLevelToInt(requiredLevelStr);

            int userRating = userSkillMap.getOrDefault(language, 0);
            boolean isMatched = userRating >= requiredLevel;

            if (isMatched) {
                matchedCount++;
            }

            SkillGapAnalysisResultDto resultDto = new SkillGapAnalysisResultDto();
            resultDto.setLanguage(language);
            resultDto.setRequiredLevel(requiredLevelStr);
            resultDto.setUserRating(userRating);
            resultDto.setMatched(isMatched);

            if (userRating == 0) {
                resultDto.setMessage("You need to learn " + language);
            } else if (userRating < requiredLevel) {
                resultDto.setMessage("you need to improve");
            } else {
                resultDto.setMessage("Skill matched!");
            }

            gapResults.add(resultDto);
        }

        int matchPercentage = targetJob.getRequirements().isEmpty() ? 0 :
                (int) Math.round(((double) matchedCount / targetJob.getRequirements().size()) * 100);

        SkillGapResponseDto responseDto = new SkillGapResponseDto();
        responseDto.setTargetRole(jobTitle);
        responseDto.setMatchPercentage(matchPercentage);
        responseDto.setAnalysis(gapResults);
        
        // Add "Your Skills" mapping for frontend
        List<Map<String, Object>> userSkillsList = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : userSkillMap.entrySet()) {
            Map<String, Object> skillInfo = new HashMap<>();
            skillInfo.put("name", entry.getKey());
            skillInfo.put("level", "Rating: " + entry.getValue());
            boolean isJobReq = targetJob.getRequirements().stream()
                    .anyMatch(r -> r.getLanguage().equalsIgnoreCase(entry.getKey()));
            skillInfo.put("status", isJobReq ? "matched" : "extra");
            userSkillsList.add(skillInfo);
        }
        responseDto.setUserSkills(userSkillsList);

        return responseDto;
    }

    private int mapLevelToInt(String level) {
        if (level == null) return 1;
        String lower = level.toLowerCase();
        if (lower.contains("advanced") || lower.contains("high")) return 4;
        if (lower.contains("intermediate") || lower.contains("medium")) return 3;
        if (lower.contains("beginner") || lower.contains("low")) return 2;
        return 2; // Default
    }
}
