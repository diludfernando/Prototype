package com.example.demo.Repository;

import com.example.demo.Model.SkillRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRatingRepository extends JpaRepository<SkillRating, Long> {
    Optional<SkillRating> findByStudentUsernameAndCategory(String username, String category);
    List<SkillRating> findByStudentUsername(String username);
}
