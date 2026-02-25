package com.example.demo.controller;

import com.example.demo.database.entity.CourseEnrollment;
import com.example.demo.database.repository.CourseEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class CourseEnrollmentController {

    @Autowired
    private CourseEnrollmentRepository repository;

    @GetMapping("/user/{userId}")
    public List<CourseEnrollment> getEnrollmentsByUserId(@PathVariable Long userId) {
        return repository.findByUserId(userId);
    }

    @PostMapping
    public CourseEnrollment enroll(@RequestBody CourseEnrollment enrollment) {
        return repository.save(enrollment);
    }

    @PutMapping("/{id}")
    public CourseEnrollment updateProgress(@PathVariable Long id, @RequestBody CourseEnrollment enrollment) {
        return repository.save(enrollment);
    }
}
