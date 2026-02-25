package com.example.demo.Controller;

import com.example.demo.Model.Question;
import com.example.demo.Repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping
    public List<Question> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level) {
        if (category != null && level != null) {
            return questionRepository.findByCategoryAndLevel(category, level);
        } else if (category != null) {
            return questionRepository.findByCategory(category);
        } else if (level != null) {
            return questionRepository.findByLevel(level);
        }
        return questionRepository.findAll();
    }

    @PostMapping
    public Question createQuestion(@RequestBody Question question) {
        return questionRepository.save(question);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        question.setContent(questionDetails.getContent());
        question.setOption1(questionDetails.getOption1());
        question.setOption2(questionDetails.getOption2());
        question.setOption3(questionDetails.getOption3());
        question.setOption4(questionDetails.getOption4());
        question.setCorrectAnswer(questionDetails.getCorrectAnswer());
        question.setCategory(questionDetails.getCategory());
        question.setLevel(questionDetails.getLevel());

        Question updatedQuestion = questionRepository.save(question);
        return ResponseEntity.ok(updatedQuestion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        questionRepository.delete(question);
        return ResponseEntity.ok().build();
    }
}
