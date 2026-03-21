package com.example.jobtrack.service;

import com.example.jobtrack.Dto.JobRecommendationDto;
import com.example.jobtrack.model.Job;
import com.example.jobtrack.model.JobSkill;
import com.example.jobtrack.model.UserSkill;
import com.example.jobtrack.repository.JobRepository;
import com.example.jobtrack.repository.JobSkillRepository;
import com.example.jobtrack.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JobRecommendationService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final UserSkillRepository userSkillRepository;

    public JobRecommendationService(JobRepository jobRepository,
                                    JobSkillRepository jobSkillRepository,
                                    UserSkillRepository userSkillRepository) {
        this.jobRepository = jobRepository;
        this.jobSkillRepository = jobSkillRepository;
        this.userSkillRepository = userSkillRepository;
    }

    public List<JobRecommendationDto> recommendJobs(Long userId, int top) {

        // Get user skills using your actual UserSkill structure
        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);

        // Map: skillId -> currentLevel
        Map<Long, Integer> userMap = new HashMap<>();
        for (UserSkill us : userSkills) {
            if (us.getSkillId() != null && us.getCurrentLevel() != null) {
                userMap.put(us.getSkillId(), us.getCurrentLevel());
            }
        }

        List<Job> jobs = jobRepository.findAll();
        List<JobRecommendationDto> results = new ArrayList<>();

        for (Job job : jobs) {
            List<JobSkill> reqs = jobSkillRepository.findByJob_Id(job.getId());

            // If no required skills for this job, skip it
            if (reqs.isEmpty()) continue;

            double sum = 0;
            int count = 0;

            for (JobSkill req : reqs) {
                Long skillId = req.getSkill().getId();
                int required = req.getRequiredLevel() == null ? 0 : req.getRequiredLevel();
                int userLevel = userMap.getOrDefault(skillId, 0);

                if (required <= 0) continue;

                double percent = (userLevel * 100.0) / required;
                if (percent > 100) percent = 100;

                sum += percent;
                count++;
            }

            double matchScore = count == 0 ? 0 : (sum / count);

            results.add(new JobRecommendationDto(
                    job.getId(),
                    job.getTitle(),
                    job.getCompany(),
                    job.getLocation(),
                    job.getCategory(),
                    job.getJobType(),
                    job.getLevel(),
                    job.getSalaryMin(),
                    job.getSalaryMax(),
                    Math.round(matchScore * 100.0) / 100.0
            ));
        }

        results.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));

        if (results.size() > top) {
            return results.subList(0, top);
        }

        return results;
    }
}