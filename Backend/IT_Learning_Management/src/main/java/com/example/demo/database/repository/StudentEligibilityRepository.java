package com.example.demo.database.repository;

import com.example.demo.database.entity.StudentEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentEligibilityRepository extends JpaRepository<StudentEligibility, Long> {
    Optional<StudentEligibility> findByStudentId(Long studentId);
}
