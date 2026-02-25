package com.user_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileCompletionResponse {

    private Double completionPercentage;
    private Integer totalFields;
    private Integer completedFields;
}
