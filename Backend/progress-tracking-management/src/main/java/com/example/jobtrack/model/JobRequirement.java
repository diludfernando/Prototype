package com.example.jobtrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_requirements")
public class JobRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language;
    private Integer percentage;

    public JobRequirement() {}

    public JobRequirement(String language, Integer percentage) {
        this.language = language;
        this.percentage = percentage;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }


    public Integer getPercentage() { return percentage; }
    public void setPercentage(Integer percentage) { this.percentage = percentage; }
}
