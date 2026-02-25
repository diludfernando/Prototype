package com.example.demo.controller;

import com.example.demo.database.entity.CourseFavorite;
import com.example.demo.database.repository.CourseFavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class CourseFavoriteController {

    @Autowired
    private CourseFavoriteRepository repository;

    @GetMapping("/user/{userId}")
    public List<CourseFavorite> getFavorites(@PathVariable Long userId) {
        return repository.findByUserId(userId);
    }

    @PostMapping
    public CourseFavorite addFavorite(@RequestBody CourseFavorite favorite) {
        return repository.save(favorite);
    }

    @DeleteMapping("/{id}")
    public void removeFavorite(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
