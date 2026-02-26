package com.example.demo.Service;

import com.example.demo.Model.Question;
import com.example.demo.Repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public List<Question> getQuestions(String category, String level) {
        if (category != null && level != null) {
            return questionRepository.findByCategoryAndLevel(category, level);
        } else if (category != null) {
            return questionRepository.findByCategory(category);
        } else if (level != null) {
            return questionRepository.findByLevel(level);
        }
        return questionRepository.findAll();
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    public Question updateQuestion(Long id, Question questionDetails) {
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

        return questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        questionRepository.delete(question);
    }
}
