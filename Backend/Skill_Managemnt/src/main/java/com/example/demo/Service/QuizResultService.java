package com.example.demo.Service;

import com.example.demo.Model.QuizResult;
import com.example.demo.Model.Student;
import com.example.demo.Repository.QuizResultRepository;
import com.example.demo.Repository.StudentRepository;
import com.example.demo.Service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class QuizResultService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProgressService progressService;

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
        
        result.setRating(rating);

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
}
