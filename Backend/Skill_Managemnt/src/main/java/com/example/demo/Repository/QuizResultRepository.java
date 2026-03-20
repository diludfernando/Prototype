package com.example.demo.Repository;

import com.example.demo.Model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    int countByStudentUsernameAndCategoryAndLevel(String username, String category, String level);
    List<QuizResult> findByStudentUsername(String username);
}
