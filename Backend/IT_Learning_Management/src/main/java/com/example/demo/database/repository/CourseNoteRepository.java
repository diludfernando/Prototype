package com.example.demo.database.repository;

import com.example.demo.database.entity.CourseNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseNoteRepository extends JpaRepository<CourseNote, Long> {
    List<CourseNote> findByUserIdAndCourseId(Long userId, Long courseId);
}
