package com.example.demo.Service;

import com.example.demo.Model.StudentSkillProgress;
import com.example.demo.Repository.StudentSkillProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentSkillProgressService {

    @Autowired
    private StudentSkillProgressRepository repository;

    public List<StudentSkillProgress> getAllProgress() {
        return repository.findAll();
    }

    public Optional<StudentSkillProgress> getProgressByStudentAndPath(Long studentId, Long pathId) {
        return repository.findByStudentIdAndCareerPathId(studentId, pathId);
    }

    public StudentSkillProgress updateProgress(StudentSkillProgress progress) {
        return repository.save(progress);
    }
}
