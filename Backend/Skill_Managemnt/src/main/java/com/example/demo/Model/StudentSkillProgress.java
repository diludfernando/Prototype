package com.example.demo.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "student_skill_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long careerPathId;
    private Integer currentSkillLevel; // Scale of 1 to 5
    private Integer highestLevelUnlocked; // 1 (Easy), 2 (Medium), or 3 (Hard)
    private Boolean isExpert; // True if Hard Level is passed
}
