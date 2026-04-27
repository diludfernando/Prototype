package com.example.jobtrack.model;

import jakarta.persistence.*;

@Entity
// 'catalog' is the database name, 'name' is the table name
@Table(name = "users", catalog = "user_management_db")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // This column exists in user_management_db
    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "assessment_easy")
    private Integer assessmentEasy = 0;

    @Column(name = "assessment_medium")
    private Integer assessmentMedium = 0;

    @Column(name = "assessment_hard")
    private Integer assessmentHard = 0;

    @Column(name = "courses_completed")
    private Integer coursesCompleted = 0;

    @Column(name = "overall_readiness_score")
    private Double overallReadinessScore = 0.0;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Integer getAssessmentEasy() { return assessmentEasy; }
    public void setAssessmentEasy(Integer assessmentEasy) { this.assessmentEasy = assessmentEasy; }

    public Integer getAssessmentMedium() { return assessmentMedium; }
    public void setAssessmentMedium(Integer assessmentMedium) { this.assessmentMedium = assessmentMedium; }

    public Integer getAssessmentHard() { return assessmentHard; }
    public void setAssessmentHard(Integer assessmentHard) { this.assessmentHard = assessmentHard; }

    public Integer getCoursesCompleted() { return coursesCompleted; }
    public void setCoursesCompleted(Integer coursesCompleted) { this.coursesCompleted = coursesCompleted; }

    public Double getOverallReadinessScore() { return overallReadinessScore; }
    public void setOverallReadinessScore(Double overallReadinessScore) { this.overallReadinessScore = overallReadinessScore; }

    // Helper for your dashboard UI
    public String getName() {
        if (email != null && email.contains("@")) {
            String prefix = email.split("@")[0];
            return prefix.substring(0, 1).toUpperCase() + prefix.substring(1);
        }
        return email != null ? email : "User";
    }
}