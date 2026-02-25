package com.example.demo.controller;

import com.example.demo.database.entity.CourseNote;
import com.example.demo.database.repository.CourseNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*")
public class CourseNoteController {

    @Autowired
    private CourseNoteRepository repository;

    @GetMapping("/user/{userId}/course/{courseId}")
    public List<CourseNote> getNotes(@PathVariable Long userId, @PathVariable Long courseId) {
        return repository.findByUserIdAndCourseId(userId, courseId);
    }

    @PostMapping
    public CourseNote addNote(@RequestBody CourseNote note) {
        return repository.save(note);
    }
}
