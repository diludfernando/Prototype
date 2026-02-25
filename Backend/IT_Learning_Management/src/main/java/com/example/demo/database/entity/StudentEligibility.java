package com.example.demo.database.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "student_eligibility")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentEligibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eligibilityId;

    private Long studentId;
    private Integer freeTrialUsed;
    private Integer freeSessions;
    private Integer hardLevelPassed;
}
