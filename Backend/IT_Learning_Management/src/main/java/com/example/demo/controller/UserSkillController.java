package com.example.demo.controller;

import com.example.demo.database.entity.UserSkill;
import com.example.demo.database.repository.UserSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "*")
public class UserSkillController {

    @Autowired
    private UserSkillRepository repository;

    @GetMapping("/user/{userId}")
    public List<UserSkill> getSkills(@PathVariable Long userId) {
        return repository.findByUserId(userId);
    }

    @PostMapping
    public UserSkill addSkill(@RequestBody UserSkill skill) {
        return repository.save(skill);
    }
}
