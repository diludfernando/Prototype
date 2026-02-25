package com.example.demo.controller;

import com.example.demo.database.entity.Achievement;
import com.example.demo.database.repository.AchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*")
public class AchievementController {

    @Autowired
    private AchievementRepository repository;

    @GetMapping("/student/{studentId}")
    public List<Achievement> getAchievements(@PathVariable Long studentId) {
        return repository.findByStudentId(studentId);
    }

    @PostMapping
    public Achievement addAchievement(@RequestBody Achievement achievement) {
        return repository.save(achievement);
    }
}
