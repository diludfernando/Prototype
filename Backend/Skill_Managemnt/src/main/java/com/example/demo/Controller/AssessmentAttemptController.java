package com.example.demo.Controller;

import com.example.demo.Model.AssessmentAttempt;
import com.example.demo.Service.AssessmentAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment-attempts")
@CrossOrigin(origins = "*")
public class AssessmentAttemptController {

    @Autowired
    private AssessmentAttemptService service;

    @GetMapping
    public List<AssessmentAttempt> getAllAttempts() {
        return service.getAllAttempts();
    }

    @GetMapping("/student/{studentId}")
    public List<AssessmentAttempt> getAttemptsByStudent(@PathVariable Long studentId) {
        return service.getAttemptsByStudent(studentId);
    }

    @PostMapping
    public AssessmentAttempt createAttempt(@RequestBody AssessmentAttempt attempt) {
        return service.createAttempt(attempt);
    }
}
