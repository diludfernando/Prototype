package com.user_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String university;

    @Column(length = 100)
    private String degreeProgram;

    @Column
    private Integer yearLevel;

    @Column(length = 100)
    private String selectedCareerPath;

    @Column(length = 500)
    private String careerGoals;

    @Column(length = 1000)
    private String skills;

    @Column(length = 500)
    private String interests;

    @Column(length = 1000)
    private String about;

    @Column
    private Double gpa;

    @Column(length = 200)
    private String linkedinUrl;

    @Column(length = 200)
    private String githubUrl;

    @Column(length = 300)
    private String profileImageUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
