package com.example.demo.Controller;

import com.example.demo.Model.UserProgress;
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

    @GetMapping("/{username:.+}")
    public ResponseEntity<?> getProgress(@PathVariable String username) {
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

    @PostMapping("/{username}/sync")
    public ResponseEntity<Void> syncProgress(@PathVariable String username) {
        progressService.syncProgress(username);
        return ResponseEntity.ok().build();
    }
}
