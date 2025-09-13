package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Order;
import com.project.cinema.movie.Repositories.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    public Order findById(Long orderId){
        return orderRepository.findById(orderId).orElse(null);
    }
    public Order save(Order order){
        return orderRepository.save(order);
    }
    public Optional<Order> findByTxnRef(String txnRef){return orderRepository.findByTxnRef(txnRef);}

    public Order createOrderForBooking(com.project.cinema.movie.Models.User user, com.project.cinema.movie.Models.Showtime showtime, double totalPrice) {
        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setStatus("PENDING");
        order.setCreatedAt(new java.util.Date());
        // Có thể set thêm các trường khác nếu cần
        return orderRepository.save(order);
    }
}
