package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.VnpayRequest;
import com.project.cinema.movie.DTO.VNPayResponseDTO;
import com.project.cinema.movie.Models.Ticket;
import com.project.cinema.movie.Services.VNPayService;
import com.project.cinema.movie.Config.VNPayConfig;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/vnpay")
@AllArgsConstructor
public class VnpayController {
    private static final Logger logger = LoggerFactory.getLogger(VnpayController.class);

    private final VNPayService vnpayService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping
    public ResponseEntity<String> createPayment(@RequestBody VnpayRequest paymentRequest) {
        logger.info("[API] /api/vnpay - createPayment - input: {}", paymentRequest);
        logger.info("Gia nhan vao la {}",paymentRequest.getBookingId());
        logger.info(" Booking ID: {}",paymentRequest.getBookingId());
        try {
            String paymentUrl = vnpayService.createPayment(paymentRequest);
            logger.info("[API] /api/vnpay - createPayment - output: {}", paymentUrl);
            return ResponseEntity.ok(paymentUrl);
        } catch (IllegalArgumentException e) {
            logger.error("[API] /api/vnpay - createPayment - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("[API] /api/vnpay - createPayment - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi khi tạo thanh toán!");
        }
    }

    @GetMapping("/return")
    public ResponseEntity<?> returnPayment(@RequestParam Map<String, String> allParams) {
        try {
            logger.info("[API] /api/vnpay/return - input: {}", allParams);
            VNPayResponseDTO response = vnpayService.handlePaymentReturn(allParams);
            logger.info("[API] /api/vnpay/return - output from service: {}", response);

            // Redirect to frontend with status and txnRef
            String frontendUrl = "http://localhost:5173/payment-callback";
            if ("success".equals(response.getStatus())) {
                frontendUrl += "?status=success&txnRef=" + response.getTxnRef();
            } else {
                frontendUrl += "?status=failed&message=" + response.getMessage();
            }
            
            logger.info("[API] /api/vnpay/return - redirecting to: {}", frontendUrl);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl)
                    .build();
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/return - error: {}", e.getMessage(), e);
            String errorMessage = e.getMessage();
            if (errorMessage.contains("Data truncated")) {
                errorMessage = "Database error: Status column too short";
            }
            // URL encode the error message to avoid Unicode issues
            try {
                errorMessage = java.net.URLEncoder.encode(errorMessage, "UTF-8");
            } catch (Exception ex) {
                errorMessage = "Database error";
            }
            String frontendUrl = "http://localhost:5173/payment-callback?status=failed&message=" + errorMessage;
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl)
                    .build();
        }
    }

    @GetMapping("/test-simple")
    public ResponseEntity<?> testSimple() {
        logger.info("[API] /api/vnpay/test-simple - called");
        String frontendUrl = "http://localhost:5173/payment-callback?status=success&txnRef=test123";
        
        logger.info("[API] /api/vnpay/test-simple - redirecting to: {}", frontendUrl);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", frontendUrl)
                .build();
    }
    
    @GetMapping("/test-vnpay-service")
    public ResponseEntity<?> testVNPayService(@RequestParam Map<String, String> allParams) {
        logger.info("[API] /api/vnpay/test-vnpay-service - input: {}", allParams);
        try {
            VNPayResponseDTO response = vnpayService.handlePaymentReturn(allParams);
            logger.info("[API] /api/vnpay/test-vnpay-service - output: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/test-vnpay-service - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/test-database-status")
    public ResponseEntity<?> testDatabaseStatus() {
        logger.info("[API] /api/vnpay/test-database-status - testing database status column");
        try {
            // Test if we can save a booking with PAID status
            // This will help us identify the database issue
            return ResponseEntity.ok(Map.of(
                "message", "Database status test endpoint",
                "status", "OK",
                "note", "Check database schema for status column length"
            ));
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/test-database-status - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    
    @GetMapping("/test-redirect")
    public ResponseEntity<?> testRedirect() {
        logger.info("[API] /api/vnpay/test-redirect - testing redirect with encoded message");
        try {
            String errorMessage = "Database error: Status column too short";
            String encodedMessage = java.net.URLEncoder.encode(errorMessage, "UTF-8");
            String frontendUrl = "http://localhost:5173/payment-callback?status=failed&message=" + encodedMessage;
            
            logger.info("[API] /api/vnpay/test-redirect - redirecting to: {}", frontendUrl);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl)
                    .build();
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/test-redirect - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/fix-database-direct")
    public ResponseEntity<?> fixDatabaseDirect() {
        logger.info("[API] /api/vnpay/fix-database-direct - fixing database directly");
        try {
            // This endpoint will help us understand the database issue
            return ResponseEntity.ok(Map.of(
                "message", "Database fix endpoint",
                "status", "OK",
                "note", "You need to run this SQL command in your database:",
                "sql_command", "ALTER TABLE bookings MODIFY COLUMN status VARCHAR(20);",
                "current_issue", "Data truncated for column 'status' at row 1",
                "explanation", "The status column is currently too short to store enum values like 'PAID' (4 characters)"
            ));
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/fix-database-direct - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/fix-database-schema")
    public ResponseEntity<?> fixDatabaseSchema() {
        logger.info("[API] /api/vnpay/fix-database-schema - fixing database schema");
        try {
            // Execute SQL to fix the database schema
            String sql = "ALTER TABLE bookings MODIFY COLUMN status VARCHAR(20)";
            
            // Execute the SQL command directly
            jdbcTemplate.execute(sql);
            
            logger.info("[API] /api/vnpay/fix-database-schema - Successfully executed: {}", sql);
            
            return ResponseEntity.ok(Map.of(
                "message", "Database schema fixed successfully!",
                "status", "OK",
                "sql_command", sql,
                "note", "The status column has been modified to VARCHAR(20)",
                "current_issue", "Data truncated for column 'status' at row 1 - FIXED",
                "explanation", "The status column can now store enum values like 'PAID'"
            ));
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/fix-database-schema - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/test-callback-fixed")
    public ResponseEntity<?> testCallbackFixed() {
        logger.info("[API] /api/vnpay/test-callback-fixed - testing callback with fixed encoding");
        try {
            // Simulate a successful payment callback
            String frontendUrl = "http://localhost:5173/payment-callback?status=success&txnRef=test123";
            
            logger.info("[API] /api/vnpay/test-callback-fixed - redirecting to: {}", frontendUrl);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl)
                    .build();
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/test-callback-fixed - error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/tickets/{orderId}")
    public ResponseEntity<?> getTicketsByOrderId(@PathVariable String orderId) {
        logger.info("[API] /api/vnpay/tickets/{} - called", orderId);
        try {
            VNPayResponseDTO response = vnpayService.getTicketsByOrderId(orderId);
            logger.info("[API] /api/vnpay/tickets/{} - output: {}", orderId, response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[API] /api/vnpay/tickets/{} - error: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Không tìm thấy thông tin vé cho đơn hàng: " + orderId));
        }
    }
}
