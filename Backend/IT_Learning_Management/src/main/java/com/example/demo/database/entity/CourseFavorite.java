package com.example.demo.database.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_favorites")
public class CourseFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long favoriteId;

    private Long courseId;
    private Long userId;
    private LocalDateTime addedDate;

    @PrePersist
    protected void onAdd() {
        addedDate = LocalDateTime.now();
    }

    // Constructors
    public CourseFavorite() {}

    public CourseFavorite(Long favoriteId, Long courseId, Long userId, LocalDateTime addedDate) {
        this.favoriteId = favoriteId;
        this.courseId = courseId;
        this.userId = userId;
        this.addedDate = addedDate;
    }

    // Getters and Setters
    public Long getFavoriteId() { return favoriteId; }
    public void setFavoriteId(Long favoriteId) { this.favoriteId = favoriteId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getAddedDate() { return addedDate; }
    public void setAddedDate(LocalDateTime addedDate) { this.addedDate = addedDate; }
}