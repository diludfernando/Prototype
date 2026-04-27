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

        int totalEasy = 0;
        int totalMedium = 0;
        int totalHard = 0;
        double totalAverage = 0.0;
        int count = ratings.size();

        for (SkillRating sr : ratings) {
            totalEasy += sr.getEasyRating();
            totalMedium += sr.getModerateRating();
            totalHard += sr.getHardRating();
            totalAverage += sr.getAverage();

            if (sr.getEasyRating() >= 14) beginnerPassed = true;
            if (sr.getModerateRating() >= 28) intermediatePassed = true;
            if (sr.getHardRating() >= 28) advancedPassed = true;
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
                .orElseGet(() -> {
                    UserProgress up = new UserProgress();
                    up.setStudent(student);
                    return up;
                });
        
        progress.setHighestLevelPassed(highestLevel);
        progress.setClearedHardestLevel(advancedPassed);
        
        progress.setEasy(count > 0 ? totalEasy / count : 0);
        progress.setMedium(count > 0 ? totalMedium / count : 0);
        progress.setHard(count > 0 ? totalHard / count : 0);
        progress.setOverallAverage(count > 0 ? totalAverage / count : 0.0);
        
        userProgressRepository.save(progress);
        System.out.println("Progress saved successfully for " + username);
    }

    public Optional<UserProgress> getProgress(String username) {
        syncProgress(username);
        return userProgressRepository.findByStudentUsername(username);
    }

    public String getHighestLevelPassedByCategory(String username, String category) {
        Optional<SkillRating> ratingOpt = skillRatingRepository.findByStudentUsernameAndCategory(username, category);
        
        if (ratingOpt.isPresent()) {
            SkillRating sr = ratingOpt.get();
            if (sr.getHardRating() >= 28) return "Advanced";
            if (sr.getModerateRating() >= 28) return "Intermediate";
            if (sr.getEasyRating() >= 14) return "Beginner";
        }

        return "None";
    }
}
