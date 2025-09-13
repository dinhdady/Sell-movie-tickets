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
    public ResponseEntity<VNPayResponseDTO> returnPayment(@RequestParam Map<String, String> allParams) {
        logger.info("[API] /api/vnpay/return - input: {}", allParams);
        VNPayResponseDTO response = vnpayService.handlePaymentReturn(allParams);
        logger.info("[API] /api/vnpay/return - output from service: {}", response);

        if ("success".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            // Trả về lỗi với thông tin chi tiết
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
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
