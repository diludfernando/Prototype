package com.user_management.repository;

import com.user_management.entity.CounselorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CounselorProfileRepository extends JpaRepository<CounselorProfile, Long> {
    Optional<CounselorProfile> findByUserId(Long userId);
}
