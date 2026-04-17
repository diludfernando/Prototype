package com.example.demo.Service;

import com.example.demo.Model.SkillRating;
import com.example.demo.Dto.JobDto;
import com.example.demo.Dto.JobRequirementDto;
import com.example.demo.Dto.SkillGapAnalysisResultDto;
import com.example.demo.Dto.SkillGapResponseDto;
import com.example.demo.Repository.SkillRatingRepository;
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
    private SkillRatingRepository skillRatingRepository;

    @Autowired
    private ProgressService progressService;

    private final RestTemplate restTemplate = new RestTemplate();

    public SkillGapResponseDto analyzeSkillGap(String username, String jobTitle) {
        // 1. Fetch user skill ratings from the new table
        List<SkillRating> skillRatings = skillRatingRepository.findByStudentUsername(username);

        // Map skill ratings by category in lowercase for case-insensitive lookup
        Map<String, SkillRating> userSkillMap = new HashMap<>();
        for (SkillRating sr : skillRatings) {
            userSkillMap.put(sr.getCategory().toLowerCase(), sr);
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
            int requiredPercentage = req.getPercentage() != null ? req.getPercentage() : 20; 

            SkillRating userSr = userSkillMap.get(language.toLowerCase());
            double userScore = userSr != null ? userSr.getAverage() : 0.0;
            boolean isMatched = userScore >= requiredPercentage;

            if (isMatched) {
                matchedCount++;
            }

            SkillGapAnalysisResultDto resultDto = new SkillGapAnalysisResultDto();
            resultDto.setLanguage(language);
            resultDto.setRequiredLevel(requiredPercentage + "%");
            resultDto.setUserRating((int)userScore);
            resultDto.setMatched(isMatched);

            if (userSr == null || userScore == 0) {
                resultDto.setMessage("You need to learn " + language);
            } else if (userScore < requiredPercentage) {
                resultDto.setMessage("You need to improve to reach " + requiredPercentage + "% proficiency");
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
        for (Map.Entry<String, SkillRating> entry : userSkillMap.entrySet()) {
            Map<String, Object> skillInfo = new HashMap<>();
            skillInfo.put("name", entry.getValue().getCategory());
            String ratingsStr = String.format("Beginner: %d | Intermediate: %d | Advanced: %d", 
                            entry.getValue().getEasyRating(),
                            entry.getValue().getModerateRating(),
                            entry.getValue().getHardRating());
            skillInfo.put("level", ratingsStr);
            boolean isJobReq = targetJob.getRequirements().stream()
                    .anyMatch(r -> r.getLanguage().equalsIgnoreCase(entry.getKey()));
            skillInfo.put("status", isJobReq ? "matched" : "extra");
            userSkillsList.add(skillInfo);
        }
        responseDto.setUserSkills(userSkillsList);
        
        // Add User Progress Info
        progressService.getProgress(username).ifPresent(progress -> {
            responseDto.setHighestLevelPassed(progress.getHighestLevelPassed());
            responseDto.setClearedHardestLevel(progress.isClearedHardestLevel());
        });

        return responseDto;
    }
}
