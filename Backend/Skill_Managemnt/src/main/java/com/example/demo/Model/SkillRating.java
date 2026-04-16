package com.example.demo.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "skill_ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String category; // e.g. "Java", "Python"
    
    private int easyRating;     // 1-5 (Beginner)
    private int moderateRating; // 1-5 (Intermediate)
    private int hardRating;     // 1-5 (Advanced)
    
    private double average;
}
