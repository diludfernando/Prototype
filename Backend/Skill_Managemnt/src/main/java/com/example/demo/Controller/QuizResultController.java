package com.example.demo.Controller;

import com.example.demo.Model.QuizResult;
import com.example.demo.Service.QuizResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizResultController {

    @Autowired
    private QuizResultService service;

    @PostMapping
    public Map<String, Object> saveResult(@RequestBody QuizResult result) {
        return service.saveResult(result);
    }
}
