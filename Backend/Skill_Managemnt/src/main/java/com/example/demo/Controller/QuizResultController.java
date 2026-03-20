package com.example.demo.Controller;

import com.example.demo.Model.QuizResult;
import com.example.demo.Service.QuizResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizResultController {

    @Autowired
    private QuizResultService service;

    @PostMapping
    public ResponseEntity<?> saveResult(@RequestBody QuizResult result) {
        try {
            return ResponseEntity.ok(service.saveResult(result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving result: " + e.getMessage());
        }
    }
}
