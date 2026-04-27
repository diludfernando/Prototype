package com.example.demo.Controller;

import com.example.demo.Service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:5173")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping
    public ResponseEntity<?> getProgress(@RequestParam String username) {
        try {
            System.out.println("GET Progress requested for: " + username);
            return progressService.getProgress(username)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProgressByCategory(@RequestParam String username, @PathVariable String category) {
        try {
            String highestLevel = progressService.getHighestLevelPassedByCategory(username, category);
            return ResponseEntity.ok(java.util.Map.of("highestLevelPassed", highestLevel));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> syncProgress(@RequestParam String username) {
        progressService.syncProgress(username);
        return ResponseEntity.ok().build();
    }
}
