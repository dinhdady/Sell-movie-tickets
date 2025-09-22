package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order,Long> {
    Optional<Order> findById(Long id);
    Optional<Order> findByTxnRef(String txnRef);
    
    // Delete orders by showtime ID
    @Modifying
    @Query("DELETE FROM Order o WHERE o.id IN (SELECT b.order.id FROM Booking b WHERE b.showtime.id = :showtimeId)")
    void deleteByShowtimeId(@Param("showtimeId") Long showtimeId);
}
