package com.example.demo.database.repository;

import com.example.demo.database.entity.CourseCompletionBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseCompletionBadgeRepository extends JpaRepository<CourseCompletionBadge, Long> {
    List<CourseCompletionBadge> findByStudentId(Long studentId);
}
