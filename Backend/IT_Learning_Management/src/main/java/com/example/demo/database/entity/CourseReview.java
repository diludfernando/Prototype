package com.example.demo.database.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "course_reviews")
public class CourseReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    private Long courseId;
    private Long userId;
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String reviewText;

    // Constructors
    public CourseReview() {}

    public CourseReview(Long reviewId, Long courseId, Long userId, Integer rating, String reviewText) {
        this.reviewId = reviewId;
        this.courseId = courseId;
        this.userId = userId;
        this.rating = rating;
        this.reviewText = reviewText;
    }

    // Getters and Setters
    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
}