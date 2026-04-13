package com.example.demo.Service;

import com.example.demo.Model.QuizResult;
import com.example.demo.Model.Student;
import com.example.demo.Model.UserProgress;
import com.example.demo.Model.SkillRating;
import com.example.demo.Repository.QuizResultRepository;
import com.example.demo.Repository.StudentRepository;
import com.example.demo.Repository.UserProgressRepository;
import com.example.demo.Repository.SkillRatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private SkillRatingRepository skillRatingRepository;

    public void syncProgress(String username) {
        // Ensure student exists
        Student student = studentRepository.findByUsername(username)
                .orElseGet(() -> {
                    Student newStudent = new Student();
                    newStudent.setUsername(username);
                    return studentRepository.save(newStudent);
                });

        // Fetch all consolidated ratings for this username
        List<SkillRating> ratings = skillRatingRepository.findByStudentUsername(username);

        // Calculate highest level passed and expert status based on ratings
        // A level is "passed" if ANY category for that level has a rating of 3 or more
        String highestLevel = "None";
        boolean beginnerPassed = false;
        boolean intermediatePassed = false;
        boolean advancedPassed = false;

        for (SkillRating sr : ratings) {
            if (sr.getEasyRating() >= 3) beginnerPassed = true;
            if (sr.getModerateRating() >= 3) intermediatePassed = true;
            if (sr.getHardRating() >= 3) advancedPassed = true;
        }

        if (advancedPassed) highestLevel = "Advanced";
        else if (intermediatePassed) highestLevel = "Intermediate";
        else if (beginnerPassed) highestLevel = "Beginner";

        System.out.println("Syncing progress for user: " + username);
        System.out.println("Skill ratings found: " + ratings.size());
        System.out.println("Beginner: " + beginnerPassed + ", Intermediate: " + intermediatePassed + ", Advanced: " + advancedPassed);
        System.out.println("Highest Level: " + highestLevel + ", Is Expert: " + advancedPassed);

        // Update or create UserProgress
        UserProgress progress = userProgressRepository.findByStudentUsername(username)
                .orElse(new UserProgress(null, student, highestLevel, advancedPassed));
        
        progress.setHighestLevelPassed(highestLevel);
        progress.setClearedHardestLevel(advancedPassed);
        
        userProgressRepository.save(progress);
        System.out.println("Progress saved successfully for " + username);
    }

    public Optional<UserProgress> getProgress(String username) {
        syncProgress(username);
        return userProgressRepository.findByStudentUsername(username);
    }

    public String getHighestLevelPassedByCategory(String username, String category) {
        List<QuizResult> results = quizResultRepository.findByStudentUsername(username);
        
        boolean beginnerPassed = false;
        boolean intermediatePassed = false;
        boolean advancedPassed = false;

        for (QuizResult res : results) {
            String dbCategory = res.getCategory() != null ? res.getCategory().trim() : "";
            if (category.trim().equalsIgnoreCase(dbCategory)) {
                double percentage = (double) res.getScore() / res.getTotalQuestions() * 100;
                System.out.println("Match found! Category: " + category + ", Level: " + res.getLevel() + ", Score: " + res.getScore() + "/" + res.getTotalQuestions() + " (" + percentage + "%)");
                if (percentage >= 50) {
                    String level = res.getLevel();
                    if ("Beginner".equalsIgnoreCase(level)) beginnerPassed = true;
                    if ("Intermediate".equalsIgnoreCase(level)) intermediatePassed = true;
                    if ("Advanced".equalsIgnoreCase(level)) advancedPassed = true;
                }
            }
        }

        if (advancedPassed) return "Advanced";
        if (intermediatePassed) return "Intermediate";
        if (beginnerPassed) return "Beginner";
        return "None";
    }
}
