package com.example.jobtrack.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_assessments")
public class UserAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id")
    private Long userId;

    @Column(name="assessment_id")
    private Long assessmentId;

    private Double score;

    @Column(name="date_taken")
    private LocalDate dateTaken;

    public UserAssessment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public LocalDate getDateTaken() { return dateTaken; }
    public void setDateTaken(LocalDate dateTaken) { this.dateTaken = dateTaken; }
}