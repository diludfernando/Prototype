package com.example.demo.Controller;

import com.example.demo.Model.StudentSkillProgress;
import com.example.demo.Service.StudentSkillProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student-skill-progress")
@CrossOrigin(origins = "*")
public class StudentSkillProgressController {

    @Autowired
    private StudentSkillProgressService service;

    @GetMapping
    public List<StudentSkillProgress> getAllProgress() {
        return service.getAllProgress();
    }

    @GetMapping("/student/{studentId}/path/{pathId}")
    public Optional<StudentSkillProgress> getProgressByStudentAndPath(
            @PathVariable Long studentId, 
            @PathVariable Long pathId) {
        return service.getProgressByStudentAndPath(studentId, pathId);
    }

    @PostMapping
    public StudentSkillProgress updateProgress(@RequestBody StudentSkillProgress progress) {
        return service.updateProgress(progress);
    }
}
