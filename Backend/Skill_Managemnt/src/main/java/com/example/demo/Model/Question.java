package com.example.demo.Model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private String correctAnswer;
    
    private String category; // e.g., Java, HTML, CSS
    private String level;    // e.g., Easy, Medium, Hard
}
