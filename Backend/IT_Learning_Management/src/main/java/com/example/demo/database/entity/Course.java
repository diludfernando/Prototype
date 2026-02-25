package com.example.demo.database.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String provider;
    private String category;
    private String difficultyLevel;

    @Column(name = "price")
    private Double cost;

    @Column(columnDefinition = "TEXT")
    private String skillsCovered;

    private Double rating;

    @Column(name = "url")
    private String courseLink;
}
