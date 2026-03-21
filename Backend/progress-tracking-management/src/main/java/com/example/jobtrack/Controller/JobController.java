package com.example.jobtrack.Controller;

import com.example.jobtrack.model.Job;
import com.example.jobtrack.repository.JobRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class JobController {

    private final JobRepository jobRepository;

    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
    }

    @PostMapping
    public Job addJob(
            @RequestBody Job job,
            @RequestHeader(value = "role", required = false) String role
    ) {
        if (role == null || !(role.equals("ADMIN") || role.equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Access Denied: Only admins can add jobs");
        }

        return jobRepository.save(job);
    }

    @PutMapping("/{id}")
    public Job updateJob(
            @PathVariable Long id,
            @RequestBody Job updatedJob,
            @RequestHeader(value = "role", required = false) String role
    ) {
        if (role == null || !(role.equals("ADMIN") || role.equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Access Denied: Only admins can update jobs");
        }

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setCompany(updatedJob.getCompany());
        job.setLocation(updatedJob.getLocation());
        job.setCategory(updatedJob.getCategory());
        job.setJobType(updatedJob.getJobType());
        job.setLevel(updatedJob.getLevel());
        job.setSalaryMin(updatedJob.getSalaryMin());
        job.setSalaryMax(updatedJob.getSalaryMax());
        job.setSourceUrl(updatedJob.getSourceUrl());

        return jobRepository.save(job);
    }

    @DeleteMapping("/{id}")
    public String deleteJob(
            @PathVariable Long id,
            @RequestHeader(value = "role", required = false) String role
    ) {
        if (role == null || !(role.equals("ADMIN") || role.equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Access Denied: Only admins can delete jobs");
        }

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        jobRepository.delete(job);
        return "Job deleted successfully";
    }
}