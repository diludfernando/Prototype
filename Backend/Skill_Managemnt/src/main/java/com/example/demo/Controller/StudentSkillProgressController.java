package com.example.demo.Controller;

import com.example.demo.Model.StudentSkillProgress;
import com.example.demo.Repository.StudentSkillProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student-skill-progress")
@CrossOrigin(origins = "*")
public class StudentSkillProgressController {

    @Autowired
    private StudentSkillProgressRepository repository;

    @GetMapping
    public List<StudentSkillProgress> getAllProgress() {
        return repository.findAll();
    }

    @GetMapping("/student/{studentId}/path/{pathId}")
    public Optional<StudentSkillProgress> getProgressByStudentAndPath(
            @PathVariable Long studentId, 
            @PathVariable Long pathId) {
        return repository.findByStudentIdAndCareerPathId(studentId, pathId);
    }

    @PostMapping
    public StudentSkillProgress updateProgress(@RequestBody StudentSkillProgress progress) {
        return repository.save(progress);
    }
}
