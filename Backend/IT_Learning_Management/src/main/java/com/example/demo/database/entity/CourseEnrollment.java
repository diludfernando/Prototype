package com.example.demo.database.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_enrollments")
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long enrollmentId;

    private Long courseId;
    private Long userId;
    private Integer progress;
    private Integer completed;
    private LocalDateTime completedDate;

    @Column(columnDefinition = "TEXT")
    private String certificateUrl;

    // "Free" or "Purchased Externally"
    private String enrollmentType;

    // Purchase proof: external course URL submitted by student
    @Column(columnDefinition = "TEXT")
    private String purchaseProofUrl;

    // Optional order/reference ID from the platform
    private String orderId;

    // Constructors
    public CourseEnrollment() {}

    // Getters and Setters
    public Long getEnrollmentId() { return enrollmentId; }
    public void setEnrollmentId(Long enrollmentId) { this.enrollmentId = enrollmentId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }

    public Integer getCompleted() { return completed; }
    public void setCompleted(Integer completed) { this.completed = completed; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }

    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }

    public String getEnrollmentType() { return enrollmentType; }
    public void setEnrollmentType(String enrollmentType) { this.enrollmentType = enrollmentType; }

    public String getPurchaseProofUrl() { return purchaseProofUrl; }
    public void setPurchaseProofUrl(String purchaseProofUrl) { this.purchaseProofUrl = purchaseProofUrl; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
}
