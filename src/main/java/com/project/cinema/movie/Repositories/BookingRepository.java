package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByShowtimeId(Long showtimeId);
    
    // Thống kê đặt vé theo ngày
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :startDate")
    Long countByCreatedDateAfter(@Param("startDate") Date startDate);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :startDate AND :endDate")
    Long countByCreatedDateBetween(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    // Thống kê doanh thu theo ngày
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.createdAt >= :startDate")
    Double calculateRevenueByDateAfter(@Param("startDate") Date startDate);
    
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.createdAt BETWEEN :startDate AND :endDate")
    Double calculateRevenueBetweenDates(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    
    // Tính tổng doanh thu
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b")
    Double calculateTotalRevenue();
    
    // Phim có nhiều đặt vé nhất
    @Query("SELECT m.title as title, COUNT(b) as bookings FROM Booking b " +
           "JOIN b.showtime s JOIN s.movie m " +
           "GROUP BY m.id, m.title " +
           "ORDER BY bookings DESC " +
           "LIMIT :limit")
    List<Map<String, Object>> findTopMoviesByBookings(@Param("limit") int limit);
    
    // Đặt vé gần đây
    @Query("SELECT b.id as id, b.totalPrice as totalPrice, b.createdAt as createdAt, " +
           "m.title as movieTitle, u.username as username FROM Booking b " +
           "JOIN b.showtime s JOIN s.movie m JOIN b.user u " +
           "ORDER BY b.createdAt DESC " +
           "LIMIT :limit")
    List<Map<String, Object>> findRecentBookings(@Param("limit") int limit);
    
    // Thống kê đặt vé theo ngày trong tuần
    @Query("SELECT DAYOFWEEK(b.createdAt) as dayOfWeek, COUNT(b) as bookingCount FROM Booking b " +
           "GROUP BY DAYOFWEEK(b.createdAt) " +
           "ORDER BY dayOfWeek")
    List<Map<String, Object>> getBookingsByDayOfWeek();
    
    // Thống kê đặt vé theo giờ
    @Query("SELECT HOUR(b.createdAt) as hour, COUNT(b) as bookingCount FROM Booking b " +
           "GROUP BY HOUR(b.createdAt) " +
           "ORDER BY hour")
    List<Map<String, Object>> getBookingsByHour();
    
    // Tìm kiếm đặt vé với filter
    @Query("SELECT b FROM Booking b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:movieTitle IS NULL OR b.showtime.movie.title LIKE %:movieTitle%) AND " +
           "(:username IS NULL OR b.user.username LIKE %:username%)")
    Page<Booking> findAllWithFilters(Pageable pageable, 
                                   @Param("status") String status,
                                   @Param("movieTitle") String movieTitle,
                                   @Param("username") String username);
    
    // Tìm kiếm đặt vé
    @Query("SELECT b FROM Booking b WHERE " +
           "b.user.username LIKE %:query% OR " +
           "b.showtime.movie.title LIKE %:query% OR " +
           "CAST(b.status AS string) LIKE %:query%")
    Page<Booking> searchBookings(@Param("query") String query, Pageable pageable);
    
}