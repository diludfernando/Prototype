package com.example.demo.controller;

import com.example.demo.database.entity.StudentEligibility;
import com.example.demo.database.repository.StudentEligibilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eligibility")
@CrossOrigin(origins = "*")
public class StudentEligibilityController {

    @Autowired
    private StudentEligibilityRepository repository;

    @GetMapping("/{studentId}")
    public StudentEligibility getEligibility(@PathVariable Long studentId) {
        // Simple search logic, simplified for the prototype
        return repository.findAll().stream()
                .filter(e -> e.getStudentId().equals(studentId))
                .findFirst()
                .orElse(null);
    }

    @PostMapping
    public StudentEligibility saveEligibility(@RequestBody StudentEligibility eligibility) {
        return repository.save(eligibility);
    }
}
