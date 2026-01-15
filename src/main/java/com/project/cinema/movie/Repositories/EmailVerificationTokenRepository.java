package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByUserId(String userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationToken e WHERE e.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationToken e WHERE e.user.id = :userId")
    void deleteByUserId(@Param("userId") String userId);
}
