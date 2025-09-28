package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.PaymentRequest;
import com.project.cinema.movie.DTO.PaymentResponse;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.MoMoService;
import com.project.cinema.movie.Services.VNPayService;
import com.project.cinema.movie.Services.ZaloPayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    @Autowired
    private VNPayService vnPayService;
    
    @Autowired
    private MoMoService moMoService;
    
    @Autowired
    private ZaloPayService zaloPayService;
    
    // Create payment
    @PostMapping("/create")
    public ResponseEntity<ResponseObject> createPayment(@Valid @RequestBody PaymentRequest request) {
        try {
            logger.info("[PaymentController] Creating payment for booking: {} with method: {}", 
                request.getBookingId(), request.getPaymentMethod());
            
            PaymentResponse response;
            
            switch (request.getPaymentMethod().toUpperCase()) {
                case "VNPAY":
                    response = vnPayService.createPayment(request);
                    break;
                case "MOMO":
                    response = moMoService.createPayment(request);
                    break;
                case "ZALOPAY":
                    response = zaloPayService.createPayment(request);
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("400", "Unsupported payment method", null));
            }
            
            return ResponseEntity.ok(new ResponseObject("200", "Payment created successfully", response));
            
        } catch (Exception e) {
            logger.error("[PaymentController] Error creating payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error creating payment: " + e.getMessage(), null));
        }
    }
    
    // VNPay callback
    @GetMapping("/vnpay/callback")
    public ResponseEntity<ResponseObject> vnPayCallback(@RequestParam Map<String, String> params) {
        try {
            logger.info("[PaymentController] VNPay callback received");
            
            boolean isValid = vnPayService.verifyPayment(params);
            if (isValid) {
                // Process successful payment
                return ResponseEntity.ok(new ResponseObject("200", "Payment verified successfully", params));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("400", "Invalid payment signature", null));
            }
        } catch (Exception e) {
            logger.error("[PaymentController] Error processing VNPay callback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error processing payment callback", null));
        }
    }
    
    // MoMo callback
    @PostMapping("/momo/notify")
    public ResponseEntity<ResponseObject> moMoCallback(@RequestBody Map<String, String> params) {
        try {
            logger.info("[PaymentController] MoMo callback received");
            
            boolean isValid = moMoService.verifyPayment(params);
            if (isValid) {
                // Process successful payment
                return ResponseEntity.ok(new ResponseObject("200", "Payment verified successfully", params));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("400", "Invalid payment signature", null));
            }
        } catch (Exception e) {
            logger.error("[PaymentController] Error processing MoMo callback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error processing payment callback", null));
        }
    }
    
    // ZaloPay callback
    @PostMapping("/zalopay/callback")
    public ResponseEntity<ResponseObject> zaloPayCallback(@RequestBody Map<String, String> params) {
        try {
            logger.info("[PaymentController] ZaloPay callback received");
            
            boolean isValid = zaloPayService.verifyPayment(params);
            if (isValid) {
                // Process successful payment
                return ResponseEntity.ok(new ResponseObject("200", "Payment verified successfully", params));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("400", "Invalid payment signature", null));
            }
        } catch (Exception e) {
            logger.error("[PaymentController] Error processing ZaloPay callback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error processing payment callback", null));
        }
    }
    
    // Get available payment methods
    @GetMapping("/methods")
    public ResponseEntity<ResponseObject> getPaymentMethods() {
        try {
            Map<String, Object> methods = Map.of(
                "VNPAY", Map.of(
                    "name", "VNPay",
                    "description", "Thanh toán qua VNPay",
                    "enabled", true,
                    "icon", "vnpay-icon"
                ),
                "MOMO", Map.of(
                    "name", "MoMo",
                    "description", "Thanh toán qua MoMo",
                    "enabled", true,
                    "icon", "momo-icon"
                ),
                "ZALOPAY", Map.of(
                    "name", "ZaloPay",
                    "description", "Thanh toán qua ZaloPay",
                    "enabled", true,
                    "icon", "zalopay-icon"
                )
            );
            
            return ResponseEntity.ok(new ResponseObject("200", "Payment methods retrieved successfully", methods));
        } catch (Exception e) {
            logger.error("[PaymentController] Error getting payment methods: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error getting payment methods", null));
        }
    }
}
