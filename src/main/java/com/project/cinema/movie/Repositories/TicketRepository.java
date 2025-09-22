package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByToken(String token);
    List<Ticket> findByOrderId(Long orderId);
    
    // Find tickets by user ID through Order
    @Query("SELECT t FROM Ticket t JOIN t.order o JOIN o.user u WHERE u.id = :userId")
    List<Ticket> findByUserId(@Param("userId") String userId);
    
    // Delete tickets by showtime ID
    @Modifying
    @Query("DELETE FROM Ticket t WHERE t.order.id IN (SELECT o.id FROM Order o JOIN Booking b ON o.id = b.order.id WHERE b.showtime.id = :showtimeId)")
    void deleteByShowtimeId(@Param("showtimeId") Long showtimeId);
}
