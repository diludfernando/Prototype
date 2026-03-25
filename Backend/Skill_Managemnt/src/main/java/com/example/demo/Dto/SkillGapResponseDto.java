package com.example.demo.Dto;

import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class SkillGapResponseDto {
    private String targetRole;
    private int matchPercentage;
    private List<SkillGapAnalysisResultDto> analysis;
    private List<Map<String, Object>> userSkills;
}
