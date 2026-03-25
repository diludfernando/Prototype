package com.example.demo.database.repository;

import com.example.demo.database.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, Long> {
    List<LessonCompletion> findByUserId(Long userId);
    List<LessonCompletion> findByUserIdAndLessonIdIn(Long userId, List<Long> lessonIds);
    Optional<LessonCompletion> findByUserIdAndLessonId(Long userId, Long lessonId);
}
