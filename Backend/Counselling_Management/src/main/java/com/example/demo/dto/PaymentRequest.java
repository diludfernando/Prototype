package com.example.demo.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String cardNumber;
    private String cardHolder;
    private String expiry;
    private String cvv;
}
