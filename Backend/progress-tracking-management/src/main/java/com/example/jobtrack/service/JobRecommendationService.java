package com.example.jobtrack.service;

import com.example.jobtrack.Dto.JobRecommendationDto;
import com.example.jobtrack.model.Job;
import com.example.jobtrack.model.JobRequirement;
import com.example.jobtrack.model.JobSkill;
import com.example.jobtrack.model.Skill;
import com.example.jobtrack.model.UserSkill;
import com.example.jobtrack.repository.JobRepository;
import com.example.jobtrack.repository.JobSkillRepository;
import com.example.jobtrack.repository.SkillRepository;
import com.example.jobtrack.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JobRecommendationService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;

    public JobRecommendationService(JobRepository jobRepository,
                                    JobSkillRepository jobSkillRepository,
                                    UserSkillRepository userSkillRepository,
                                    SkillRepository skillRepository) {
        this.jobRepository = jobRepository;
        this.jobSkillRepository = jobSkillRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillRepository = skillRepository;
    }

    public List<JobRecommendationDto> recommendJobs(Long userId, int top) {

        // Load user skills
        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);

        // Map: skillId -> currentLevel
        Map<Long, Integer> userMap = new HashMap<>();
        for (UserSkill us : userSkills) {
            if (us.getSkillId() != null && us.getCurrentLevel() != null) {
                userMap.put(us.getSkillId(), us.getCurrentLevel());
            }
        }

        // Also build name->level map from known skills so we can match by name if IDs differ
        Map<String, Integer> userMapByName = new HashMap<>();
        List<Skill> allSkills = skillRepository.findAll();
        if (!allSkills.isEmpty() && !userMap.isEmpty()) {
            for (Skill s : allSkills) {
                if (s.getId() != null && s.getSkillName() != null) {
                    Integer lvl = userMap.get(s.getId());
                    if (lvl != null) {
                        userMapByName.put(s.getSkillName().toLowerCase(), lvl);
                    }
                }
            }
        }

        List<Job> jobs = jobRepository.findAll();
        List<JobRecommendationDto> results = new ArrayList<>();

        for (Job job : jobs) {
            double sum = 0;
            int count = 0;

            // 1) Try structured JobSkill table first. If present, use it exclusively.
            List<JobSkill> structuredReqs = jobSkillRepository.findByJob_Id(job.getId());
            if (structuredReqs != null && !structuredReqs.isEmpty()) {
                for (JobSkill req : structuredReqs) {
                    Long skillId = req.getSkill() != null ? req.getSkill().getId() : null;
                    String skillName = req.getSkill() != null ? req.getSkill().getSkillName() : null;
                    int required = req.getRequiredLevel() == null ? 0 : req.getRequiredLevel();
                    int userLevel = 0;
                    if (skillId != null) userLevel = userMap.getOrDefault(skillId, 0);
                    if (userLevel == 0 && skillName != null) {
                        Integer byName = userMapByName.get(skillName.toLowerCase());
                        if (byName != null) userLevel = byName;
                    }

                    if (required <= 0) continue;

                    // Compute ratio user/required and convert to 0-100, cap at 100
                    double percent = ((double) userLevel / (double) required) * 100.0;
                    percent = Math.min(Math.max(percent, 0.0), 100.0);

                    sum += percent;
                    count++;
                }
            } else {
                // 2) Fall back to legacy JobRequirement (language + percentage) only when no structured requirements exist
                List<JobRequirement> legacyReqs = job.getRequirements();
                if (legacyReqs != null && !legacyReqs.isEmpty()) {
                    // use previously loaded allSkills for case-insensitive mapping

                    for (JobRequirement req : legacyReqs) {
                        String lang = req.getLanguage();
                        int requiredPct = req.getPercentage() == null ? 20 : req.getPercentage(); // expected 0-100

                        if (requiredPct <= 0) continue;

                        // Find matching skill by name (case-insensitive)
                        Skill matched = null;
                        if (lang != null) {
                            // try exact match first
                            matched = skillRepository.findBySkillName(lang);
                            if (matched == null) {
                                for (Skill s : allSkills) {
                                    if (s.getSkillName() != null && s.getSkillName().equalsIgnoreCase(lang)) {
                                        matched = s;
                                        break;
                                    }
                                }
                            }
                        }

                        if (matched == null) {
                            // try fuzzy substring match as last resort
                            if (lang != null) {
                                String low = lang.toLowerCase();
                                for (Skill s : allSkills) {
                                    if (s.getSkillName() != null && s.getSkillName().toLowerCase().contains(low)) {
                                        matched = s;
                                        break;
                                    }
                                }
                            }
                        }

                        if (matched == null) {
                            // can't map language to internal skill id; skip this requirement
                            continue;
                        }

                        int userLevel = userMap.getOrDefault(matched.getId(), 0); // assume 0-5
                        int userPct = Math.min(Math.max(userLevel * 20, 0), 100); // convert to 0-100

                        // Calculate match as (userPct / requiredPct) * 100, then cap to 100
                        double percentMatch = ((double) userPct / (double) requiredPct) * 100.0;
                        percentMatch = Math.min(Math.max(percentMatch, 0.0), 100.0);

                        sum += percentMatch;
                        count++;
                    }
                }
            }

            if (count == 0) continue; // no mappable requirements - skip

            double matchScore = (sum / count);

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