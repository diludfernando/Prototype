package com.example.demo.Service;

import com.example.demo.Model.AssessmentAttempt;
import com.example.demo.Repository.AssessmentAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentAttemptService {

    @Autowired
    private AssessmentAttemptRepository repository;

    public List<AssessmentAttempt> getAllAttempts() {
        return repository.findAll();
    }

    public List<AssessmentAttempt> getAttemptsByStudent(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    public AssessmentAttempt createAttempt(AssessmentAttempt attempt) {
        return repository.save(attempt);
    }
}
