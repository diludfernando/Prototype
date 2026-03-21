package com.example.jobtrack.Controller;

import com.example.jobtrack.model.Job;
import com.example.jobtrack.model.JobApplication;
import com.example.jobtrack.repository.JobApplicationRepository;
import com.example.jobtrack.repository.JobRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-applications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class JobApplicationController {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;

    public JobApplicationController(JobApplicationRepository jobApplicationRepository,
                                    JobRepository jobRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.jobRepository = jobRepository;
    }

    @PostMapping
    public JobApplication submitApplication(@RequestBody JobApplication application) {
        Job job = jobRepository.findById(application.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        application.setJobCategory(job.getCategory());

        int years = application.getYearsOfExperience() == null ? 0 : application.getYearsOfExperience();

        if (years <= 1) {
            application.setApplicationCategory("FRESHER");
        } else if (years <= 3) {
            application.setApplicationCategory("JUNIOR");
        } else {
            application.setApplicationCategory("EXPERIENCED");
        }

        application.setStatus("SUBMITTED");

        return jobApplicationRepository.save(application);
    }

    @GetMapping
    public List<JobApplication> getAllApplications() {
        return jobApplicationRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<JobApplicationResponse> getApplicationsByUser(@PathVariable Long userId) {
        List<JobApplication> applications = jobApplicationRepository.findByUserIdOrderByAppliedAtDesc(userId);

        return applications.stream().map(application -> {
            Job job = jobRepository.findById(application.getJobId()).orElse(null);

            JobApplicationResponse response = new JobApplicationResponse();
            response.setId(application.getId());
            response.setUserId(application.getUserId());
            response.setJobId(application.getJobId());
            response.setApplicantName(application.getApplicantName());
            response.setEmail(application.getEmail());
            response.setPhone(application.getPhone());
            response.setCurrentLocation(application.getCurrentLocation());
            response.setYearsOfExperience(application.getYearsOfExperience());
            response.setCvUrl(application.getCvUrl());
            response.setPortfolioUrl(application.getPortfolioUrl());
            response.setCoverLetter(application.getCoverLetter());
            response.setStatus(application.getStatus());
            response.setApplicationCategory(application.getApplicationCategory());
            response.setJobCategory(application.getJobCategory());
            response.setAppliedAt(application.getAppliedAt());

            if (job != null) {
                response.setJobTitle(job.getTitle());
                response.setCompany(job.getCompany());
                response.setLocation(job.getLocation());
            }

            return response;
        }).collect(Collectors.toList());
    }

    public static class JobApplicationResponse {
        private Long id;
        private Long userId;
        private Long jobId;
        private String applicantName;
        private String email;
        private String phone;
        private String currentLocation;
        private Integer yearsOfExperience;
        private String cvUrl;
        private String portfolioUrl;
        private String coverLetter;
        private String status;
        private String applicationCategory;
        private String jobCategory;
        private java.time.LocalDateTime appliedAt;
        private String jobTitle;
        private String company;
        private String location;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Long getJobId() { return jobId; }
        public void setJobId(Long jobId) { this.jobId = jobId; }

        public String getApplicantName() { return applicantName; }
        public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCurrentLocation() { return currentLocation; }
        public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

        public Integer getYearsOfExperience() { return yearsOfExperience; }
        public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

        public String getCvUrl() { return cvUrl; }
        public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }

        public String getPortfolioUrl() { return portfolioUrl; }
        public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getApplicationCategory() { return applicationCategory; }
        public void setApplicationCategory(String applicationCategory) { this.applicationCategory = applicationCategory; }

        public String getJobCategory() { return jobCategory; }
        public void setJobCategory(String jobCategory) { this.jobCategory = jobCategory; }

        public java.time.LocalDateTime getAppliedAt() { return appliedAt; }
        public void setAppliedAt(java.time.LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }
}