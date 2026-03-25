package com.example.demo.database.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String provider;
    private String category;
    
    @Column(name = "difficulty_level")
    private String difficultyLevel;

    private Double price;

    @Column(name = "skills_covered", columnDefinition = "TEXT")
    private String skillsCovered;

    private Double rating;

    private String url;

    // Constructors
    public Course() {}

    public Course(Long id, String title, String provider, String category, String difficultyLevel, 
                  Double price, String skillsCovered, Double rating, String url) {
        this.id = id;
        this.title = title;
        this.provider = provider;
        this.category = category;
        this.difficultyLevel = difficultyLevel;
        this.price = price;
        this.skillsCovered = skillsCovered;
        this.rating = rating;
        this.url = url;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getSkillsCovered() { return skillsCovered; }
    public void setSkillsCovered(String skillsCovered) { this.skillsCovered = skillsCovered; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}