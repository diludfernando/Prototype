package com.example.jobtrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_requirements")
public class JobRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language;
    private String level;

    public JobRequirement() {}

    public JobRequirement(String language, String level) {
        this.language = language;
        this.level = level;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}
