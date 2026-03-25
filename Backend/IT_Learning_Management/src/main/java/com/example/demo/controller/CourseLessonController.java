package com.example.demo.controller;

import com.example.demo.database.entity.CourseLesson;
import com.example.demo.database.entity.LessonCompletion;
import com.example.demo.database.repository.CourseLessonRepository;
import com.example.demo.database.repository.LessonCompletionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "*")
public class CourseLessonController {

    @Autowired
    private CourseLessonRepository lessonRepository;

    @Autowired
    private LessonCompletionRepository completionRepository;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseLesson>> getLessonsByCourse(@PathVariable Long courseId) {
        List<CourseLesson> lessons = lessonRepository.findByCourseIdOrderByOrderNumber(courseId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/course/{courseId}/progress/{userId}")
    public ResponseEntity<Map<String, Object>> getCourseProgress(@PathVariable Long courseId, @PathVariable Long userId) {
        List<CourseLesson> lessons = lessonRepository.findByCourseIdOrderByOrderNumber(courseId);
        List<Long> lessonIds = lessons.stream().map(CourseLesson::getLessonId).collect(Collectors.toList());
        
        List<LessonCompletion> completions = completionRepository.findByUserIdAndLessonIdIn(userId, lessonIds);
        
        int totalLessons = lessons.size();
        int completedLessons = completions.size();
        int progress = totalLessons > 0 ? (completedLessons * 100) / totalLessons : 0;
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalLessons", totalLessons);
        response.put("completedLessons", completedLessons);
        response.put("progress", progress);
        response.put("completedLessonIds", completions.stream().map(LessonCompletion::getLessonId).collect(Collectors.toList()));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<LessonCompletion> markLessonComplete(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long lessonId = request.get("lessonId");
        
        // Check if already completed
        if (completionRepository.findByUserIdAndLessonId(userId, lessonId).isPresent()) {
            return ResponseEntity.ok().build();
        }
        
        LessonCompletion completion = new LessonCompletion();
        completion.setUserId(userId);
        completion.setLessonId(lessonId);
        completion.setCompletedAt(LocalDateTime.now());
        
        LessonCompletion saved = completionRepository.save(completion);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping
    public ResponseEntity<CourseLesson> createLesson(@RequestBody CourseLesson lesson) {
        // Auto-assign order number as next in sequence
        List<CourseLesson> existing = lessonRepository.findByCourseIdOrderByOrderNumber(lesson.getCourseId());
        if (lesson.getOrderNumber() == null || lesson.getOrderNumber() == 0) {
            lesson.setOrderNumber(existing.size() + 1);
        }
        CourseLesson saved = lessonRepository.save(lesson);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<CourseLesson> updateLesson(@PathVariable Long lessonId, @RequestBody CourseLesson lesson) {
        return lessonRepository.findById(lessonId).map(existing -> {
            existing.setTitle(lesson.getTitle());
            existing.setDescription(lesson.getDescription());
            existing.setVideoUrl(lesson.getVideoUrl());
            existing.setDurationMinutes(lesson.getDurationMinutes());
            if (lesson.getOrderNumber() != null && lesson.getOrderNumber() > 0) {
                existing.setOrderNumber(lesson.getOrderNumber());
            }
            return ResponseEntity.ok(lessonRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            return ResponseEntity.notFound().build();
        }
        lessonRepository.deleteById(lessonId);
        return ResponseEntity.noContent().build();
    }
}
