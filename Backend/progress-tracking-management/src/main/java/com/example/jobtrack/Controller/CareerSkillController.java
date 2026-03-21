package com.example.jobtrack.Controller;

import com.example.jobtrack.model.CareerSkill;
import com.example.jobtrack.repository.CareerSkillRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/career-skills")
@CrossOrigin
public class CareerSkillController {

    private final CareerSkillRepository careerSkillRepository;

    public CareerSkillController(CareerSkillRepository careerSkillRepository) {
        this.careerSkillRepository = careerSkillRepository;
    }

    // ✅ Get all required skills for one career
    @GetMapping("/career/{careerId}")
    public List<CareerSkill> getSkillsForCareer(@PathVariable Long careerId) {
        return careerSkillRepository.findByCareerId(careerId);
    }

    // ✅ Add one required skill to a career
    @PostMapping
    public CareerSkill addCareerSkill(@RequestBody CareerSkill careerSkill) {
        return careerSkillRepository.save(careerSkill);
    }
}