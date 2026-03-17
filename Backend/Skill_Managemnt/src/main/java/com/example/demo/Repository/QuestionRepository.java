package com.example.demo.Repository;

import com.example.demo.Model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategoryAndLevel(String category, String level);
    List<Question> findByCategory(String category);
    List<Question> findByLevel(String level);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT q.category FROM Question q")
    List<String> findDistinctCategories();
}
