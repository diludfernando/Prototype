package com.example.demo.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class PaymentRequest {
    @NotBlank(message = "cardNumber is required.")
    private String cardNumber;

    @NotBlank(message = "expiry is required.")
    private String expiry;

    @NotBlank(message = "cvv is required.")
    private String cvv;
}
