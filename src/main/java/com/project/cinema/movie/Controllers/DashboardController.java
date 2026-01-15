package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/overview")
    public ResponseEntity<ResponseObject> getDashboardOverview() {
        try {
            Map<String, Object> overview = dashboardService.getDashboardOverview();
            return ResponseEntity.ok(new ResponseObject("200", "Dashboard overview retrieved successfully!", overview));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving dashboard overview: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/revenue-stats")
    public ResponseEntity<ResponseObject> getRevenueStatistics() {
        try {
            Map<String, Object> revenueStats = dashboardService.getRevenueStatistics();
            return ResponseEntity.ok(new ResponseObject("200", "Revenue statistics retrieved successfully!", revenueStats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving revenue statistics: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/booking-stats")
    public ResponseEntity<ResponseObject> getBookingStatistics() {
        try {
            Map<String, Object> bookingStats = dashboardService.getBookingStatistics();
            return ResponseEntity.ok(new ResponseObject("200", "Booking statistics retrieved successfully!", bookingStats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving booking statistics: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-stats")
    public ResponseEntity<ResponseObject> getUserStatistics() {
        try {
            Map<String, Object> userStats = dashboardService.getUserStatistics();
            return ResponseEntity.ok(new ResponseObject("200", "User statistics retrieved successfully!", userStats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving user statistics: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/movie-stats")
    public ResponseEntity<ResponseObject> getMovieStatistics() {
        try {
            Map<String, Object> movieStats = dashboardService.getMovieStatistics();
            return ResponseEntity.ok(new ResponseObject("200", "Movie statistics retrieved successfully!", movieStats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving movie statistics: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/recent-activity")
    public ResponseEntity<ResponseObject> getRecentActivity() {
        try {
            Map<String, Object> recentActivity = dashboardService.getRecentActivity();
            return ResponseEntity.ok(new ResponseObject("200", "Recent activity retrieved successfully!", recentActivity));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving recent activity: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/top-movies")
    public ResponseEntity<ResponseObject> getTopRevenueMovies() {
        try {
            Map<String, Object> topMovies = dashboardService.getTopRevenueMovies();
            return ResponseEntity.ok(new ResponseObject("200", "Top movies statistics retrieved successfully!", topMovies));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving top movies: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user-analytics")
    public ResponseEntity<ResponseObject> getUserAnalytics() {
        try {
            Map<String, Object> userAnalytics = dashboardService.getUserAnalytics();
            return ResponseEntity.ok(new ResponseObject("200", "User analytics retrieved successfully!", userAnalytics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving user analytics: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/booking-analytics")
    public ResponseEntity<ResponseObject> getBookingAnalytics() {
        try {
            Map<String, Object> bookingAnalytics = dashboardService.getBookingAnalytics();
            return ResponseEntity.ok(new ResponseObject("200", "Booking analytics retrieved successfully!", bookingAnalytics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving booking analytics: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/revenue-analytics")
    public ResponseEntity<ResponseObject> getRevenueAnalytics() {
        try {
            Map<String, Object> revenueAnalytics = dashboardService.getRevenueAnalytics();
            return ResponseEntity.ok(new ResponseObject("200", "Revenue analytics retrieved successfully!", revenueAnalytics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving revenue analytics: " + e.getMessage(), null));
        }
    }
}
