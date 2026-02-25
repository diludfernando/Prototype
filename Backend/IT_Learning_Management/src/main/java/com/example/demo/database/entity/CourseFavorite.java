package com.example.demo.database.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_favorites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long favoriteId;

    private Long courseId;
    private Long userId;
    private LocalDateTime addedDate;

    @PrePersist
    protected void onAdd() {
        addedDate = LocalDateTime.now();
    }
}
