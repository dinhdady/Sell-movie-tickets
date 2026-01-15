package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.EventUsage;
import com.project.cinema.movie.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventUsageRepository extends JpaRepository<EventUsage, Long> {
    
    // Tìm usage theo user
    List<EventUsage> findByUser(User user);
    
    // Tìm usage theo event
    List<EventUsage> findByEventId(Long eventId);
    
    // Kiểm tra user đã sử dụng event này chưa
    @Query("SELECT COUNT(eu) > 0 FROM EventUsage eu WHERE eu.user.id = :userId AND eu.event.id = :eventId")
    boolean hasUserUsedEvent(@Param("userId") Long userId, @Param("eventId") Long eventId);
    
    // Đếm số lần sử dụng event
    @Query("SELECT COUNT(eu) FROM EventUsage eu WHERE eu.event.id = :eventId")
    long countUsageByEventId(@Param("eventId") Long eventId);
    
    // Tìm usage trong khoảng thời gian
    @Query("SELECT eu FROM EventUsage eu WHERE eu.usedAt BETWEEN :startDate AND :endDate")
    List<EventUsage> findByUsedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Tìm usage theo user trong khoảng thời gian
    @Query("SELECT eu FROM EventUsage eu WHERE eu.user.id = :userId AND eu.usedAt BETWEEN :startDate AND :endDate")
    List<EventUsage> findByUserAndUsedAtBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
