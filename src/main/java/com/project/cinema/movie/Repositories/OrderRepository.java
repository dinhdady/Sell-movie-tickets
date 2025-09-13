package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order,Long> {
    Optional<Order> findById(Long id);
    Optional<Order> findByTxnRef(String txnRef);
}
