package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.PaymentRequest;
import com.project.cinema.movie.DTO.PaymentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.*;

@Service
public class MoMoService {
    
    private static final Logger logger = LoggerFactory.getLogger(MoMoService.class);
    
    @Value("${momo.partner-code:}")
    private String partnerCode;
    
    @Value("${momo.access-key:}")
    private String accessKey;
    
    @Value("${momo.secret-key:}")
    private String secretKey;
    
    @Value("${momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String endpoint;
    
    @Value("${momo.return-url:http://localhost:5173/payment/callback}")
    private String returnUrl;
    
    @Value("${momo.notify-url:http://localhost:8080/api/payment/momo/notify}")
    private String notifyUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public PaymentResponse createPayment(PaymentRequest request) {
        try {
            logger.info("[MoMoService] Creating payment for booking: {}", request.getBookingId());
            
            String orderId = "MOMO_" + System.currentTimeMillis();
            String requestId = UUID.randomUUID().toString();
            String orderInfo = request.getDescription() != null ? request.getDescription() : "Thanh toan dat ve xem phim";
            
            // Create request data
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("partnerCode", partnerCode);
            requestData.put("partnerName", "Cinema Booking System");
            requestData.put("partnerClientId", "CinemaBooking");
            requestData.put("accessKey", accessKey);
            requestData.put("requestId", requestId);
            requestData.put("amount", request.getAmount().longValue());
            requestData.put("orderId", orderId);
            requestData.put("orderInfo", orderInfo);
            requestData.put("redirectUrl", returnUrl);
            requestData.put("ipnUrl", notifyUrl);
            requestData.put("extraData", "");
            requestData.put("requestType", "captureWallet");
            requestData.put("autoCapture", true);
            requestData.put("lang", "vi");
            
            // Create signature
            String signature = createSignature(requestData);
            requestData.put("signature", signature);
            
            // Send request to MoMo
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            logger.info("[MoMoService] Request data: {}", requestData);
            logger.info("[MoMoService] Sending request to: {}", endpoint);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint, 
                HttpMethod.POST, 
                entity, 
                Map.class
            );
            
            logger.info("[MoMoService] Response status: {}", response.getStatusCode());
            logger.info("[MoMoService] Response body: {}", response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseData = (Map<String, Object>) response.getBody();
                
                PaymentResponse paymentResponse = new PaymentResponse();
                String payUrl = responseData != null ? (String) responseData.get("payUrl") : null;
                paymentResponse.setPaymentUrl(payUrl != null ? payUrl : "");
                paymentResponse.setTransactionId(orderId);
                paymentResponse.setPaymentMethod("MOMO");
                paymentResponse.setStatus("PENDING");
                paymentResponse.setMessage("Payment created successfully");
                paymentResponse.setAmount(request.getAmount().longValue());
                paymentResponse.setCurrency("VND");
                paymentResponse.setReturnUrl(returnUrl);
                paymentResponse.setCancelUrl(request.getCancelUrl());
                
                logger.info("[MoMoService] Payment created successfully: {}", orderId);
                return paymentResponse;
            } else {
                throw new RuntimeException("Failed to create MoMo payment");
            }
            
        } catch (Exception e) {
            logger.error("[MoMoService] Error creating payment: {}", e.getMessage());
            throw new RuntimeException("Failed to create MoMo payment: " + e.getMessage());
        }
    }
    
    public boolean verifyPayment(Map<String, String> params) {
        try {
            String signature = params.get("signature");
            // Convert Map<String, String> to Map<String, Object>
            Map<String, Object> paramsAsObject = new HashMap<>(params);
            String expectedSignature = createSignature(paramsAsObject);
            
            return signature != null && signature.equals(expectedSignature);
        } catch (Exception e) {
            logger.error("[MoMoService] Error verifying payment: {}", e.getMessage());
            return false;
        }
    }
    
    private String createSignature(Map<String, Object> data) {
        try {
            // Create query string in specific order as required by MoMo
            StringBuilder queryString = new StringBuilder();
            
            // Add fields in the exact order MoMo expects (matching the error message format)
            queryString.append("accessKey=").append(data.get("accessKey")).append("&");
            queryString.append("amount=").append(data.get("amount")).append("&");
            queryString.append("extraData=").append(data.get("extraData")).append("&");
            queryString.append("ipnUrl=").append(data.get("ipnUrl")).append("&");
            queryString.append("orderId=").append(data.get("orderId")).append("&");
            queryString.append("orderInfo=").append(data.get("orderInfo")).append("&");
            queryString.append("partnerClientId=").append(data.get("partnerClientId")).append("&");
            queryString.append("partnerCode=").append(data.get("partnerCode")).append("&");
            queryString.append("redirectUrl=").append(data.get("redirectUrl")).append("&");
            queryString.append("requestId=").append(data.get("requestId")).append("&");
            queryString.append("requestType=").append(data.get("requestType"));
            
            logger.info("[MoMoService] Query string for signature: {}", queryString.toString());
            
            // Create HMAC SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(queryString.toString().getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            String signature = hexString.toString();
            logger.info("[MoMoService] Generated signature: {}", signature);
            return signature;
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("[MoMoService] Error creating signature: {}", e.getMessage());
            throw new RuntimeException("Error creating signature");
        }
    }
}
