package com.example.demo.repository;

import com.example.demo.model.SessionNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SessionNoteRepository extends JpaRepository<SessionNote, Long> {
}
