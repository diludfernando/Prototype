package com.example.jobtrack.Controller;

import com.example.jobtrack.model.Career;
import com.example.jobtrack.repository.CareerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/careers")
@CrossOrigin
public class CareerController {

    private final CareerRepository careerRepository;

    public CareerController(CareerRepository careerRepository) {
        this.careerRepository = careerRepository;
    }

    @GetMapping
    public List<Career> getAllCareers() {
        return careerRepository.findAll();
    }

    @PostMapping
    public Career createCareer(@RequestBody Career career) {
        return careerRepository.save(career);
    }
}