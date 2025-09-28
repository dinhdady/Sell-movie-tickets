package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.PasswordResetOTP;
import com.project.cinema.movie.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetOTPRepository extends JpaRepository<PasswordResetOTP, Long> {
    
    // Find valid OTP for user
    @Query("SELECT o FROM PasswordResetOTP o WHERE o.user = :user AND o.otp = :otp AND o.isUsed = false AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    Optional<PasswordResetOTP> findValidOTP(@Param("user") User user, @Param("otp") String otp, @Param("now") LocalDateTime now);
    
    // Find latest valid OTP for user
    @Query("SELECT o FROM PasswordResetOTP o WHERE o.user = :user AND o.isUsed = false AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    Optional<PasswordResetOTP> findLatestValidOTP(@Param("user") User user, @Param("now") LocalDateTime now);
    
    // Delete expired OTPs
    void deleteByExpiresAtBefore(LocalDateTime now);
    
    // Delete used OTPs
    void deleteByIsUsedTrue();
}
