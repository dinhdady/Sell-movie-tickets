package com.project.cinema.movie.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ScheduledTaskService {
    
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);
    
    @Autowired
    private BookingService bookingService;
    
    // Run every 5 minutes to check for expired showtimes
    @Scheduled(fixedRate = 300000) // 5 minutes = 300000 milliseconds
    public void releaseSeatsForExpiredShowtimes() {
        logger.info("[ScheduledTask] Starting scheduled task: releaseSeatsForExpiredShowtimes");
        try {
            bookingService.releaseSeatsForExpiredShowtimes();
            logger.info("[ScheduledTask] Completed scheduled task: releaseSeatsForExpiredShowtimes");
        } catch (Exception e) {
            logger.error("[ScheduledTask] Error in scheduled task releaseSeatsForExpiredShowtimes: {}", e.getMessage());
        }
    }
    
    // Run every 2 minutes to check for pending payments timeout
    @Scheduled(fixedRate = 120000) // 2 minutes = 120000 milliseconds
    public void autoTimeoutPayments() {
        logger.info("[ScheduledTask] Starting scheduled task: autoTimeoutPayments");
        try {
            bookingService.autoTimeoutPayments();
            logger.info("[ScheduledTask] Completed scheduled task: autoTimeoutPayments");
        } catch (Exception e) {
            logger.error("[ScheduledTask] Error in scheduled task autoTimeoutPayments: {}", e.getMessage());
        }
    }
}
