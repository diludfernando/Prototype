package com.example.demo.Service;

import com.example.demo.Model.QuizResult;
import com.example.demo.Repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class QuizResultService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    public Map<String, Object> saveResult(QuizResult result) {
        // Save the result to the database
        QuizResult savedResult = quizResultRepository.save(result);

        // Calculate performance feedback
        double percentage = (double) savedResult.getScore() / savedResult.getTotalQuestions() * 100;
        
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

        // Prepare the response
        Map<String, Object> response = new HashMap<>();
        response.put("result", savedResult);
        response.put("feedback", Map.of(
            "title", title,
            "message", message
        ));

        return response;
    }
}
