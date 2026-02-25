package com.example.demo.controller;

import com.example.demo.database.entity.CourseReview;
import com.example.demo.database.repository.CourseReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class CourseReviewController {

    @Autowired
    private CourseReviewRepository repository;

    @GetMapping("/course/{courseId}")
    public List<CourseReview> getReviews(@PathVariable Long courseId) {
        return repository.findByCourseId(courseId);
    }

    @PostMapping
    public CourseReview addReview(@RequestBody CourseReview review) {
        return repository.save(review);
    }
}
