package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Payment;
import com.project.cinema.movie.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findById(String id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    
    // Thống kê người dùng theo ngày tạo
    @Query("SELECT COUNT(u) FROM User u WHERE u.registrationDate >= :startDate")
    Long countByRegistrationDateAfter(@Param("startDate") LocalDateTime startDate);
    
    // Thống kê người dùng theo vai trò
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") String role);
    
    // Người dùng hoạt động (có đặt vé)
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.orders o JOIN Booking b ON b.order = o")
    Long countActiveUsers();
    
    // Người dùng mới nhất
    @Query("SELECT u.username as username, u.email as email, u.registrationDate as registrationDate FROM User u " +
           "ORDER BY u.registrationDate DESC " +
           "LIMIT :limit")
    List<Map<String, Object>> findRecentUsers(@Param("limit") int limit);
    
    // Thống kê đặt vé của người dùng
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId")
    Long countUserBookings(@Param("userId") String userId);
    
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.user.id = :userId")
    Double calculateUserTotalSpent(@Param("userId") String userId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.createdAt >= :startDate")
    Long countRecentUserBookings(@Param("userId") String userId, @Param("startDate") Date startDate);
    
    // Lịch sử đặt vé của người dùng
    @Query("SELECT b.id as id, b.totalPrice as totalPrice, b.createdAt as createdAt, " +
           "m.title as movieTitle, s.startTime as showtime FROM Booking b " +
           "JOIN b.showtime s JOIN s.movie m WHERE b.user.id = :userId " +
           "ORDER BY b.createdAt DESC")
    List<Map<String, Object>> findUserBookings(@Param("userId") String userId);
    
    // Tìm kiếm người dùng
    @Query("SELECT u FROM User u WHERE u.username LIKE %:query% OR u.email LIKE %:query% OR u.fullName LIKE %:query%")
    List<User> searchUsers(@Param("query") String query);
    
    // Lấy lịch sử thanh toán của user
    @Query("SELECT p FROM Payment p WHERE p.booking.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findUserPayments(@Param("userId") String userId);
}