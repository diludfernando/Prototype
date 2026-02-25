package com.example.demo.Controller;

import com.example.demo.Model.AssessmentAttempt;
import com.example.demo.Repository.AssessmentAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment-attempts")
@CrossOrigin(origins = "*")
public class AssessmentAttemptController {

    @Autowired
    private AssessmentAttemptRepository repository;

    @GetMapping
    public List<AssessmentAttempt> getAllAttempts() {
        return repository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<AssessmentAttempt> getAttemptsByStudent(@PathVariable Long studentId) {
        return repository.findByStudentId(studentId);
    }

    @PostMapping
    public AssessmentAttempt createAttempt(@RequestBody AssessmentAttempt attempt) {
        return repository.save(attempt);
    }
}
