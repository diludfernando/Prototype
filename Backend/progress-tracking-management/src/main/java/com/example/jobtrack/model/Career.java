package com.example.jobtrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "careers")
public class Career {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Double averageSalary;
    private Double growthRate;

    // Constructors
    public Career() {
    }

    public Career(String title, String description, Double averageSalary, Double growthRate) {
        this.title = title;
        this.description = description;
        this.averageSalary = averageSalary;
        this.growthRate = growthRate;
    }

    // Getters and Setters
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public Double getAverageSalary() { return averageSalary; }

    public void setAverageSalary(Double averageSalary) { this.averageSalary = averageSalary; }

    public Double getGrowthRate() { return growthRate; }

    public void setGrowthRate(Double growthRate) { this.growthRate = growthRate; }
}