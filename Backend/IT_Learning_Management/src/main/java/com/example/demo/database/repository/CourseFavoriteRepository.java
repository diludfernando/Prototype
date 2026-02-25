package com.example.demo.database.repository;

import com.example.demo.database.entity.CourseFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseFavoriteRepository extends JpaRepository<CourseFavorite, Long> {
    List<CourseFavorite> findByUserId(Long userId);
}
