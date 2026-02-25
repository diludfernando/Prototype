package com.example.demo.controller;

import com.example.demo.database.entity.CourseCompletionBadge;
import com.example.demo.database.repository.CourseCompletionBadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "*")
public class CourseCompletionBadgeController {

    @Autowired
    private CourseCompletionBadgeRepository repository;

    @GetMapping("/student/{studentId}")
    public List<CourseCompletionBadge> getBadges(@PathVariable Long studentId) {
        return repository.findByStudentId(studentId);
    }

    @PostMapping
    public CourseCompletionBadge addBadge(@RequestBody CourseCompletionBadge badge) {
        return repository.save(badge);
    }
}
