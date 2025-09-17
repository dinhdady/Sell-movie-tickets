package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.OrderDTO;
import com.project.cinema.movie.Models.Order;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Services.OrderService;
import com.project.cinema.movie.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ResponseObject> createOrder(@RequestBody OrderDTO orderDTO) {
        try {
            // Validate user
            User user = userService.getUserById(orderDTO.getUserId());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("ERROR", "User not found!", null));
            }

            // Create order
            Order order = orderService.createOrder(orderDTO);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject("SUCCESS", "Order created successfully!", order));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Failed to create order: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("ERROR", "Order not found!", null));
            }
            
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Order retrieved successfully!", order));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Failed to retrieve order: " + e.getMessage(), null));
        }
    }

    @GetMapping("/txnRef/{txnRef}")
    public ResponseEntity<ResponseObject> getOrderByTxnRef(@PathVariable String txnRef) {
        try {
            Optional<Order> order = orderService.getOrderByTxnRef(txnRef);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("ERROR", "Order not found!", null));
            }
            
            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Order retrieved successfully!", order));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Failed to retrieve order: " + e.getMessage(), null));
        }
    }
}
