package com.example.demo.database.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "course_completion_badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseCompletionBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long badgeId;

    private Long studentId;
    private String badgeType;
    private Integer coursesCompleted;
}
