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
        
        int rating = 1;
        if (percentage >= 80) {
            rating = 5;
        } else if (percentage >= 60) {
            rating = 4;
        } else if (percentage >= 40) {
            rating = 3;
        } else if (percentage >= 20) {
            rating = 2;
        }
        
        String title;
        String message;

        if (percentage == 100) {
            title = "Absolute Perfection!";
            message = "You've mastered the basics! Ready for the Intermediate challenge?";
        } else if (percentage >= 80) {
            title = "Excellent Work!";
            message = "You have a solid foundation. Keep pushing forward!";
        } else if (percentage >= 50) {
            title = "Good Job!";
            message = "You're on the right track. A bit more practice and you'll be an expert.";
        } else {
            title = "Keep Learning!";
            message = "Review the basics and try again. Practice makes perfect.";
        }

        // Save the result to the database
        QuizResult savedResult = quizResultRepository.save(result);

        // Update Separate Level Ratings in SkillRating table
        updateSkillRating(username, result.getCategory(), result.getLevel(), rating, student);

        // Trigger Progress Sync
        progressService.syncProgress(username);

        // Prepare the response
        response.put("result", savedResult);
        response.put("attemptCount", savedResult.getAttemptNumber());
        response.put("feedback", Map.of(
            "title", title,
            "message", message
        ));

        return response;
    }

    public List<QuizResult> getResultsByUsername(String username) {
        return quizResultRepository.findByStudentUsername(username);
    }

    private void updateSkillRating(String username, String category, String level, int newRating, Student student) {
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
            if (newRating > skillRating.getEasyRating()) {
                skillRating.setEasyRating(newRating);
                updated = true;
            }
        } else if ("Intermediate".equalsIgnoreCase(level) || "Moderate".equalsIgnoreCase(level) || "Medium".equalsIgnoreCase(level)) {
            if (newRating > skillRating.getModerateRating()) {
                skillRating.setModerateRating(newRating);
                updated = true;
            }
        } else if ("Advanced".equalsIgnoreCase(level) || "Hard".equalsIgnoreCase(level)) {
            if (newRating > skillRating.getHardRating()) {
                skillRating.setHardRating(newRating);
                updated = true;
            }
        }

        if (updated) {
            skillRatingRepository.save(skillRating);
        }
    }
}
