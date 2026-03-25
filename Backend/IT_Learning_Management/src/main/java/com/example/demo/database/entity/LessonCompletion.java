package com.example.demo.database.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_completions")
public class LessonCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long completionId;

    private Long userId;
    private Long lessonId;
    private LocalDateTime completedAt;

    // Constructors
    public LessonCompletion() {}

    // Getters and Setters
    public Long getCompletionId() { return completionId; }
    public void setCompletionId(Long completionId) { this.completionId = completionId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
