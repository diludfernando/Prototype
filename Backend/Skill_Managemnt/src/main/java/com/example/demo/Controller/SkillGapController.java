package com.example.demo.Controller;

import com.example.demo.Dto.SkillGapResponseDto;
import com.example.demo.Service.SkillGapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gap-analysis")
@CrossOrigin("*")
public class SkillGapController {

    @Autowired
    private SkillGapService skillGapService;

    @GetMapping
    public ResponseEntity<SkillGapResponseDto> getGapAnalysis(
            @RequestParam("username") String username,
            @RequestParam("jobTitle") String jobTitle) {
        SkillGapResponseDto response = skillGapService.analyzeSkillGap(username, jobTitle);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
