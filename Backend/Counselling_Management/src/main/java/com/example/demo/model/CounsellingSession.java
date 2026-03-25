package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotNull(message = "studentId is required.")
    private Long studentId;

    @NotNull(message = "counsellorId is required.")
    private Long counsellorId;

    private String counsellorName;

    @NotNull(message = "sessionDate is required.")
    @Future(message = "sessionDate must be a future date.")
    private LocalDate sessionDate;

    @NotBlank(message = "timeSlot is required.")
    private String timeSlot;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @NotNull(message = "isFree is required.")
    private Boolean isFree;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
}
