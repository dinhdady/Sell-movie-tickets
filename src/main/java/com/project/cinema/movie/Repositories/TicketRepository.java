package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByToken(String token);
    List<Ticket> findByOrderId(Long orderId);
}
