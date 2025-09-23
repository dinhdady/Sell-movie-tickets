package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Event;
import com.project.cinema.movie.Models.EventStatus;
import com.project.cinema.movie.Models.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Tìm tất cả event đang hoạt động
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.status = :status AND :now BETWEEN e.startDate AND e.endDate")
    List<Event> findActiveEvents(@Param("status") EventStatus status, @Param("now") LocalDateTime now);
    
    // Tìm event theo type
    List<Event> findByType(EventType type);
    
    // Tìm event theo status
    List<Event> findByStatus(EventStatus status);
    
    // Tìm event sắp bắt đầu (trong 7 ngày tới)
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.status = :status AND e.startDate BETWEEN :now AND :sevenDaysLater")
    List<Event> findUpcomingEvents(@Param("status") EventStatus status, @Param("now") LocalDateTime now, @Param("sevenDaysLater") LocalDateTime sevenDaysLater);
    
    // Tìm event sắp kết thúc (trong 7 ngày tới)
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.status = :status AND e.endDate BETWEEN :now AND :sevenDaysLater")
    List<Event> findEndingSoonEvents(@Param("status") EventStatus status, @Param("now") LocalDateTime now, @Param("sevenDaysLater") LocalDateTime sevenDaysLater);
    
    // Tìm event đã hết hạn
    @Query("SELECT e FROM Event e WHERE e.endDate < :now AND e.status = :status")
    List<Event> findExpiredEvents(@Param("now") LocalDateTime now, @Param("status") EventStatus status);
    
    // Tìm event có thể áp dụng cho order amount
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.status = :status AND :now BETWEEN e.startDate AND e.endDate AND e.minimumOrderAmount <= :orderAmount")
    List<Event> findApplicableEvents(@Param("status") EventStatus status, @Param("now") LocalDateTime now, @Param("orderAmount") Double orderAmount);
    
    // Tìm event theo tên (tìm kiếm)
    @Query("SELECT e FROM Event e WHERE e.name LIKE %:name% OR e.description LIKE %:name%")
    List<Event> findByNameContaining(@Param("name") String name);
    
    // Đếm số lượng event đang hoạt động
    @Query("SELECT COUNT(e) FROM Event e WHERE e.isActive = true AND e.status = :status")
    long countActiveEvents(@Param("status") EventStatus status);
    
    // Tìm event hiện tại (đang diễn ra)
    @Query("SELECT e FROM Event e WHERE e.isActive = true AND e.status = :status AND :now BETWEEN e.startDate AND e.endDate ORDER BY e.startDate DESC")
    List<Event> findCurrentEvents(@Param("status") EventStatus status, @Param("now") LocalDateTime now);
}
