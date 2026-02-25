package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "counselling_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CounsellingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student ID only, simulating no foreign microservice connection here
    private Long studentId;

    private Long counsellorId;

    private LocalDate sessionDate;

    private String timeSlot;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    private Boolean isFree;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
}
