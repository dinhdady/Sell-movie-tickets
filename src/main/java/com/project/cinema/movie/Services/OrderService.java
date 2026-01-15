package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.OrderDTO;
import com.project.cinema.movie.Models.Order;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Repositories.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserService userService;
    
    public Order findById(Long orderId){
        return orderRepository.findById(orderId).orElse(null);
    }
    
    public Order getOrderById(Long orderId){
        return orderRepository.findById(orderId).orElse(null);
    }
    
    public Optional<Order> getOrderByTxnRef(String txnRef){
        return orderRepository.findByTxnRef(txnRef);
    }
    
    public Order save(Order order){
        return orderRepository.save(order);
    }
    
    public Optional<Order> findByTxnRef(String txnRef){
        return orderRepository.findByTxnRef(txnRef);
    }

    public Order createOrderForBooking(User user, com.project.cinema.movie.Models.Showtime showtime, double totalPrice) {
        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setStatus("PENDING");
        order.setCreatedAt(new java.util.Date());
        return orderRepository.save(order);
    }
    
    public Order createOrder(OrderDTO orderDTO) {
        // Get user
        User user = userService.getUserById(orderDTO.getUserId());
        if (user == null) {
            throw new RuntimeException("User not found: " + orderDTO.getUserId());
        }
        
        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(orderDTO.getTotalPrice());
        order.setStatus("PENDING");
        order.setCustomerEmail(orderDTO.getCustomerEmail());
        order.setCreatedAt(new java.util.Date());
        
        return orderRepository.save(order);
    }
}
