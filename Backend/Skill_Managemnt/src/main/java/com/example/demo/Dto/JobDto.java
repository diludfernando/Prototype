package com.example.demo.Dto;

import java.util.List;
import lombok.Data;

@Data
public class JobDto {
    private Long id;
    private String title;
    private List<JobRequirementDto> requirements;
}
