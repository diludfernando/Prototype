package com.example.demo.Dto;

import lombok.Data;

@Data
public class SkillGapAnalysisResultDto {
    private String language;
    private String requiredLevel;
    private int userRating;
    private boolean isMatched;
    private String message;
}
