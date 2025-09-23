package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.OrderDTO;
import com.project.cinema.movie.Models.Order;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Services.OrderService;
import com.project.cinema.movie.Services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    @PostMapping
    public ResponseEntity<ResponseObject> createOrder(@RequestBody OrderDTO orderDTO) {
        try {
            
            // Validate orderDTO
            if (orderDTO == null) {
                logger.info("[OrderController] OrderDTO is null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("ERROR", "Order data is required!", null));
            }
            
            if (orderDTO.getUserId() == null || orderDTO.getUserId().trim().isEmpty()) {
                logger.info("[OrderController] UserId is null or empty: " + orderDTO.getUserId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("ERROR", "User ID is required!", null));
            }
            
            if (orderDTO.getTotalPrice() <= 0) {
                logger.info("[OrderController] TotalPrice is invalid: " + orderDTO.getTotalPrice());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("ERROR", "Total price must be greater than 0!", null));
            }

            // Validate user
            logger.info("[OrderController] Looking for user with ID: " + orderDTO.getUserId());
            User user = userService.getUserById(orderDTO.getUserId());
            if (user == null) {
                logger.info("[OrderController] User not found with ID: " + orderDTO.getUserId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("ERROR", "User not found!", null));
            }
            
            logger.info("[OrderController] User found: " + user.getUsername());

            // Create order
            logger.info("[OrderController] Creating order...");
            Order order = orderService.createOrder(orderDTO);
            logger.info("[OrderController] Order created with ID: " + order.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject("SUCCESS", "Order created successfully!", order));
                
        } catch (Exception e) {
            System.err.println("[OrderController] Error creating order: " + e.getMessage());
            e.printStackTrace();
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
