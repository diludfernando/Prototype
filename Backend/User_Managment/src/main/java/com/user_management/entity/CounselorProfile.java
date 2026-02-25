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
@Table(name = "counselor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 200)
    private String qualification;

    @Column(nullable = false, length = 200)
    private String specialization;

    @Column(nullable = false)
    private Integer yearsOfExperience;

    @Column(nullable = false, length = 1000)
    private String shortBio;

    @Column(length = 200)
    private String linkedinUrl;

    @Column(length = 300)
    private String profileImageUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
