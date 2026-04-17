package com.example.demo.Service;

import com.example.demo.Model.QuizResult;
import com.example.demo.Model.Student;
import com.example.demo.Model.SkillRating;
import com.example.demo.Repository.QuizResultRepository;
import com.example.demo.Repository.StudentRepository;
import com.example.demo.Repository.SkillRatingRepository;
import com.example.demo.Service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizResultService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private SkillRatingRepository skillRatingRepository;

    public Map<String, Object> saveResult(QuizResult result) {
        String username = result.getUsername();
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }

        // Ensure student exists in Skill_Managemnt database
        Student student = studentRepository.findByUsername(username)
                .orElseGet(() -> {
                    Student newStudent = new Student();
                    newStudent.setUsername(username);
                    return studentRepository.save(newStudent);
                });

        result.setStudent(student);

        // First, check the current attempt count for this specific quiz (username, category, level)
        int currentCount = quizResultRepository.countByStudentUsernameAndCategoryAndLevel(
            username, 
            result.getCategory(), 
            result.getLevel()
        );

        Map<String, Object> response = new HashMap<>();

        // Set the attempt number for the new record
        result.setAttemptNumber(currentCount + 1);

        // Calculate performance feedback
        double percentage = (double) result.getScore() / result.getTotalQuestions() * 100;
        
        // The earned percentage scaled properly for this specific level's weight.
        int levelPercentage = 0;
        String levelStr = result.getLevel();
        if ("Beginner".equalsIgnoreCase(levelStr) || "Easy".equalsIgnoreCase(levelStr)) {
            levelPercentage = (int) Math.round(percentage * 0.20); // 20% max for easy
        } else if ("Intermediate".equalsIgnoreCase(levelStr) || "Moderate".equalsIgnoreCase(levelStr) || "Medium".equalsIgnoreCase(levelStr)) {
            levelPercentage = (int) Math.round(percentage * 0.40); // 40% max for moderate
        } else if ("Advanced".equalsIgnoreCase(levelStr) || "Hard".equalsIgnoreCase(levelStr)) {
            levelPercentage = (int) Math.round(percentage * 0.40); // 40% max for hard
        } else {
            levelPercentage = result.getScore() * 2; // Default fallback
        }

        
        // Save the result to the database
        QuizResult savedResult = quizResultRepository.save(result);

        // Update Separate Level Ratings in SkillRating table
        updateSkillRating(username, result.getCategory(), result.getLevel(), levelPercentage, student);

        // Trigger Progress Sync
        progressService.syncProgress(username);

        // Prepare the response
        response.put("result", savedResult);
        response.put("attemptCount", savedResult.getAttemptNumber());

        return response;
    }

    public List<QuizResult> getResultsByUsername(String username) {
        return quizResultRepository.findByStudentUsername(username);
    }

    private void updateSkillRating(String username, String category, String level, int newPercentage, Student student) {
        SkillRating skillRating = skillRatingRepository.findByStudentUsernameAndCategory(username, category)
                .orElseGet(() -> {
                    SkillRating newSkillRating = new SkillRating();
                    newSkillRating.setStudent(student);
                    newSkillRating.setCategory(category);
                    newSkillRating.setEasyRating(0);
                    newSkillRating.setModerateRating(0);
                    newSkillRating.setHardRating(0);
                    return newSkillRating;
                });

        boolean updated = false;
        if ("Beginner".equalsIgnoreCase(level) || "Easy".equalsIgnoreCase(level)) {
            if (newPercentage > skillRating.getEasyRating()) {
                skillRating.setEasyRating(newPercentage);
                updated = true;
            }
        } else if ("Intermediate".equalsIgnoreCase(level) || "Moderate".equalsIgnoreCase(level) || "Medium".equalsIgnoreCase(level)) {
            if (newPercentage > skillRating.getModerateRating()) {
                skillRating.setModerateRating(newPercentage);
                updated = true;
            }
        } else if ("Advanced".equalsIgnoreCase(level) || "Hard".equalsIgnoreCase(level)) {
            if (newPercentage > skillRating.getHardRating()) {
                skillRating.setHardRating(newPercentage);
                updated = true;
            }
        }

        if (updated) {
            double cumulativeScore = skillRating.getEasyRating() + 
                                     skillRating.getModerateRating() + 
                                     skillRating.getHardRating();
            skillRating.setAverage(cumulativeScore);
            skillRatingRepository.save(skillRating);
        }
    }
}
