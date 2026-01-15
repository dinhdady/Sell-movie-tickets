package com.project.cinema.movie.Services;

import com.project.cinema.movie.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Date;

@Service
public class DashboardService {
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ShowtimeRepository showtimeRepository;

    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Tổng quan hệ thống
        overview.put("totalMovies", movieRepository.count());
        overview.put("totalUsers", userRepository.count());
        overview.put("totalBookings", bookingRepository.count());
        overview.put("totalRevenue", bookingRepository.calculateTotalRevenue() != null ? 
            bookingRepository.calculateTotalRevenue() : 0.0);
        
        // Thống kê theo trạng thái
        overview.put("nowShowingMovies", movieRepository.countByStatus("NOW_SHOWING"));
        overview.put("comingSoonMovies", movieRepository.countByStatus("COMING_SOON"));
        overview.put("endedMovies", movieRepository.countByStatus("ENDED"));
        
        // Thống kê ngày hôm nay
        LocalDate today = LocalDate.now();
        Date todayStart = java.sql.Date.valueOf(today);
        overview.put("bookingsToday", bookingRepository.countByCreatedDateAfter(todayStart));
        overview.put("revenueToday", bookingRepository.calculateRevenueByDateAfter(todayStart));
        
        return overview;
    }

    public Map<String, Object> getRevenueStatistics() {
        Map<String, Object> revenueStats = new HashMap<>();
        
        // Tổng doanh thu
        Double totalRevenue = bookingRepository.calculateTotalRevenue();
        Long totalBookings = bookingRepository.count();
        
        revenueStats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        revenueStats.put("totalBookings", totalBookings != null ? totalBookings : 0L);
        revenueStats.put("averageRevenue", totalRevenue != null && totalBookings != null && totalBookings > 0 
            ? totalRevenue / totalBookings : 0.0);
        
        // Doanh thu theo tháng (7 tháng gần nhất)
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            Date monthStartDate = java.sql.Date.valueOf(monthStart);
            Date monthEndDate = java.sql.Date.valueOf(monthEnd);
            
            Double monthRevenue = bookingRepository.calculateRevenueBetweenDates(monthStartDate, monthEndDate);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            monthData.put("revenue", monthRevenue != null ? monthRevenue : 0.0);
            monthlyRevenue.add(monthData);
        }
        revenueStats.put("monthlyRevenue", monthlyRevenue);
        
        return revenueStats;
    }

    public Map<String, Object> getBookingStatistics() {
        Map<String, Object> bookingStats = new HashMap<>();
        
        // Tổng đặt vé
        Long totalBookings = bookingRepository.count();
        bookingStats.put("totalBookings", totalBookings);
        
        // Đặt vé theo ngày (7 ngày gần nhất)
        List<Map<String, Object>> dailyBookings = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Date dateStart = java.sql.Date.valueOf(date);
            Date dateEnd = java.sql.Date.valueOf(date.plusDays(1).minusDays(1));
            
            Long dayBookings = bookingRepository.countByCreatedDateBetween(dateStart, dateEnd);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.format(DateTimeFormatter.ofPattern("dd/MM")));
            dayData.put("bookings", dayBookings != null ? dayBookings : 0L);
            dailyBookings.add(dayData);
        }
        bookingStats.put("dailyBookings", dailyBookings);
        
        // Đặt vé theo phim (top 5)
        List<Map<String, Object>> topMovies = bookingRepository.findTopMoviesByBookings(5);
        bookingStats.put("topMovies", topMovies);
        
        return bookingStats;
    }

    public Map<String, Object> getUserStatistics() {
        Map<String, Object> userStats = new HashMap<>();
        
        // Tổng người dùng
        Long totalUsers = userRepository.count();
        userStats.put("totalUsers", totalUsers);
        
        // Người dùng mới (7 ngày gần nhất)
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        Long newUsers = userRepository.countByRegistrationDateAfter(weekAgo.atStartOfDay());
        userStats.put("newUsers", newUsers);
        
        // Người dùng theo vai trò
        Long adminUsers = userRepository.countByRole("ADMIN");
        Long regularUsers = userRepository.countByRole("USER");
        userStats.put("adminUsers", adminUsers);
        userStats.put("regularUsers", regularUsers);
        
        // Người dùng hoạt động (có đặt vé)
        Long activeUsers = userRepository.countActiveUsers();
        userStats.put("activeUsers", activeUsers);
        
        return userStats;
    }

    public Map<String, Object> getMovieStatistics() {
        Map<String, Object> movieStats = new HashMap<>();
        
        // Tổng phim
        Long totalMovies = movieRepository.count();
        movieStats.put("totalMovies", totalMovies);
        
        // Phim theo trạng thái
        Long nowShowing = movieRepository.countByStatus("NOW_SHOWING");
        Long comingSoon = movieRepository.countByStatus("COMING_SOON");
        Long ended = movieRepository.countByStatus("ENDED");
        
        movieStats.put("nowShowing", nowShowing);
        movieStats.put("comingSoon", comingSoon);
        movieStats.put("ended", ended);
        
        // Phim theo thể loại
        List<Map<String, Object>> genreStats = movieRepository.getMovieCountByGenre();
        movieStats.put("genreStats", genreStats);
        
        // Phim có doanh thu cao nhất (top 5)
        List<Map<String, Object>> topRevenueMovies = movieRepository.findTopMoviesByRevenue(5);
        movieStats.put("topRevenueMovies", topRevenueMovies);
        
        return movieStats;
    }

    public Map<String, Object> getRecentActivity() {
        Map<String, Object> recentActivity = new HashMap<>();
        
        // Đặt vé gần đây (10 đặt vé mới nhất)
        List<Map<String, Object>> recentBookings = bookingRepository.findRecentBookings(10);
        recentActivity.put("recentBookings", recentBookings);
        
        // Người dùng mới (10 người dùng mới nhất)
        List<Map<String, Object>> recentUsers = userRepository.findRecentUsers(10);
        recentActivity.put("recentUsers", recentUsers);
        
        // Phim mới (5 phim mới nhất)
        List<Map<String, Object>> recentMovies = movieRepository.findRecentMovies(5);
        recentActivity.put("recentMovies", recentMovies);
        
        return recentActivity;
    }

    // Thống kê nâng cao - Top phim doanh thu
    public Map<String, Object> getTopRevenueMovies() {
        Map<String, Object> topMovies = new HashMap<>();
        
        // Top 5 phim doanh thu cao nhất
        List<Map<String, Object>> topRevenueMovies = movieRepository.findTopMoviesByRevenue(5);
        topMovies.put("topRevenueMovies", topRevenueMovies);
        
        // Top 5 phim đặt vé nhiều nhất
        List<Map<String, Object>> topBookingMovies = bookingRepository.findTopMoviesByBookings(5);
        topMovies.put("topBookingMovies", topBookingMovies);
        
        return topMovies;
    }

    // Thống kê nâng cao - User analytics
    public Map<String, Object> getUserAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Thống kê user theo thời gian
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        LocalDate monthAgo = LocalDate.now().minusDays(30);
        
        Long newUsersWeek = userRepository.countByRegistrationDateAfter(weekAgo.atStartOfDay());
        Long newUsersMonth = userRepository.countByRegistrationDateAfter(monthAgo.atStartOfDay());
        Long activeUsers = userRepository.countActiveUsers();
        Long totalUsers = userRepository.count();
        
        analytics.put("newUsersWeek", newUsersWeek);
        analytics.put("newUsersMonth", newUsersMonth);
        analytics.put("activeUsers", activeUsers);
        analytics.put("totalUsers", totalUsers);
        analytics.put("activeUserRate", totalUsers > 0 ? (double) activeUsers / totalUsers * 100 : 0.0);
        
        return analytics;
    }

    // Thống kê nâng cao - Booking analytics
    public Map<String, Object> getBookingAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Thống kê đặt vé theo ngày (7 ngày gần nhất)
        List<Map<String, Object>> dailyBookings = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Date dateStart = java.sql.Date.valueOf(date);
            Date dateEnd = java.sql.Date.valueOf(date.plusDays(1).minusDays(1));
            
            Long dayBookings = bookingRepository.countByCreatedDateBetween(dateStart, dateEnd);
            Double dayRevenue = bookingRepository.calculateRevenueBetweenDates(dateStart, dateEnd);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.format(DateTimeFormatter.ofPattern("dd/MM")));
            dayData.put("bookings", dayBookings != null ? dayBookings : 0L);
            dayData.put("revenue", dayRevenue != null ? dayRevenue : 0.0);
            dailyBookings.add(dayData);
        }
        analytics.put("dailyBookings", dailyBookings);
        
        // Thống kê đặt vé theo giờ (24 giờ gần nhất)
        List<Map<String, Object>> hourlyBookings = new ArrayList<>();
        for (int i = 23; i >= 0; i--) {
            LocalDateTime hourStart = LocalDateTime.now().minusHours(i).withMinute(0).withSecond(0);
            LocalDateTime hourEnd = hourStart.plusHours(1);
            
            Date hourStartDate = java.sql.Timestamp.valueOf(hourStart);
            Date hourEndDate = java.sql.Timestamp.valueOf(hourEnd);
            
            Long hourBookings = bookingRepository.countByCreatedDateBetween(hourStartDate, hourEndDate);
            
            Map<String, Object> hourData = new HashMap<>();
            hourData.put("hour", hourStart.format(DateTimeFormatter.ofPattern("HH:00")));
            hourData.put("bookings", hourBookings != null ? hourBookings : 0L);
            hourlyBookings.add(hourData);
        }
        analytics.put("hourlyBookings", hourlyBookings);
        
        return analytics;
    }

    // Thống kê nâng cao - Revenue analytics
    public Map<String, Object> getRevenueAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Doanh thu theo tháng (12 tháng gần nhất)
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            Date monthStartDate = java.sql.Date.valueOf(monthStart);
            Date monthEndDate = java.sql.Date.valueOf(monthEnd);
            
            Double monthRevenue = bookingRepository.calculateRevenueBetweenDates(monthStartDate, monthEndDate);
            Long monthBookings = bookingRepository.countByCreatedDateBetween(monthStartDate, monthEndDate);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            monthData.put("revenue", monthRevenue != null ? monthRevenue : 0.0);
            monthData.put("bookings", monthBookings != null ? monthBookings : 0L);
            monthData.put("averageRevenue", monthBookings != null && monthBookings > 0 ? monthRevenue / monthBookings : 0.0);
            monthlyRevenue.add(monthData);
        }
        analytics.put("monthlyRevenue", monthlyRevenue);
        
        // Tổng doanh thu
        Double totalRevenue = bookingRepository.calculateTotalRevenue();
        Long totalBookings = bookingRepository.count();
        
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        analytics.put("totalBookings", totalBookings);
        analytics.put("averageRevenuePerBooking", totalBookings != null && totalBookings > 0 ? totalRevenue / totalBookings : 0.0);
        
        return analytics;
    }
} 