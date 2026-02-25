package com.example.demo.Repository;

import com.example.demo.Model.StudentSkillProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentSkillProgressRepository extends JpaRepository<StudentSkillProgress, Long> {
    Optional<StudentSkillProgress> findByStudentIdAndCareerPathId(Long studentId, Long careerPathId);
}
