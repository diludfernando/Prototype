package com.example.jobtrack.Dto;

public class JobRecommendationDto {
    private Long jobId;
    private String title;
    private String company;
    private String location;
    private String category;
    private String jobType;
    private String level;
    private Double salaryMin;
    private Double salaryMax;
    private Double matchScore; // 0 - 100

    public JobRecommendationDto() {}

    public JobRecommendationDto(Long jobId, String title, String company, String location,
                                String category, String jobType, String level,
                                Double salaryMin, Double salaryMax, Double matchScore) {
        this.jobId = jobId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.category = category;
        this.jobType = jobType;
        this.level = level;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.matchScore = matchScore;
    }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Double getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Double salaryMin) { this.salaryMin = salaryMin; }

    public Double getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Double salaryMax) { this.salaryMax = salaryMax; }

    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }
}