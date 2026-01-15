package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.PaymentRequest;
import com.project.cinema.movie.DTO.PaymentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class ZaloPayService {
    
    private static final Logger logger = LoggerFactory.getLogger(ZaloPayService.class);
    
    @Value("${zalopay.app-id:}")
    private String appId;
    
    @Value("${zalopay.key1:}")
    private String key1;
    
    @Value("${zalopay.key2:}")
    private String key2;
    
    @Value("${zalopay.endpoint:https://sb-openapi.zalopay.vn/v2/create}")
    private String endpoint;
    
    @Value("${zalopay.return-url:http://localhost:5173/payment/callback}")
    private String returnUrl;
    
    @Value("${zalopay.callback-url:http://localhost:8080/api/payment/zalopay/callback}")
    private String callbackUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public PaymentResponse createPayment(PaymentRequest request) {
        try {
            logger.info("[ZaloPayService] Creating payment for booking: {}", request.getBookingId());
            
            String appTransId = "ZALOPAY_" + System.currentTimeMillis();
            long amount = request.getAmount().longValue();
            String description = request.getDescription() != null ? request.getDescription() : "Thanh toan dat ve xem phim";
            
            // Create request data
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("app_id", appId);
            requestData.put("app_user", "CinemaBooking");
            requestData.put("app_time", System.currentTimeMillis());
            requestData.put("amount", amount);
            requestData.put("app_trans_id", appTransId);
            requestData.put("description", description);
            requestData.put("bank_code", "zalopayapp");
            requestData.put("item", "[]");
            requestData.put("embed_data", "{}");
            requestData.put("callback_url", callbackUrl);
            requestData.put("return_url", returnUrl);
            
            // Create MAC
            String mac = createMac(requestData);
            requestData.put("mac", mac);
            
            // Send request to ZaloPay
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(
                endpoint, 
                HttpMethod.POST, 
                entity, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseData = (Map<String, Object>) response.getBody();
                
                PaymentResponse paymentResponse = new PaymentResponse();
                String orderUrl = responseData != null ? (String) responseData.get("order_url") : null;
                paymentResponse.setPaymentUrl(orderUrl != null ? orderUrl : "");
                paymentResponse.setTransactionId(appTransId);
                paymentResponse.setPaymentMethod("ZALOPAY");
                paymentResponse.setStatus("PENDING");
                paymentResponse.setMessage("Payment created successfully");
                paymentResponse.setAmount(amount);
                paymentResponse.setCurrency("VND");
                paymentResponse.setReturnUrl(returnUrl);
                paymentResponse.setCancelUrl(request.getCancelUrl());
                
                logger.info("[ZaloPayService] Payment created successfully: {}", appTransId);
                return paymentResponse;
            } else {
                throw new RuntimeException("Failed to create ZaloPay payment");
            }
            
        } catch (Exception e) {
            logger.error("[ZaloPayService] Error creating payment: {}", e.getMessage());
            throw new RuntimeException("Failed to create ZaloPay payment: " + e.getMessage());
        }
    }
    
    public boolean verifyPayment(Map<String, String> params) {
        try {
            String mac = params.get("mac");
            // Convert Map<String, String> to Map<String, Object>
            Map<String, Object> paramsAsObject = new HashMap<>(params);
            String expectedMac = createMac(paramsAsObject);
            
            return mac != null && mac.equals(expectedMac);
        } catch (Exception e) {
            logger.error("[ZaloPayService] Error verifying payment: {}", e.getMessage());
            return false;
        }
    }
    
    private String createMac(Map<String, Object> data) {
        try {
            // Sort parameters
            List<String> sortedKeys = new ArrayList<>(data.keySet());
            Collections.sort(sortedKeys);
            
            StringBuilder queryString = new StringBuilder();
            for (String key : sortedKeys) {
                if (!key.equals("mac") && data.get(key) != null) {
                    queryString.append(key).append("=").append(data.get(key)).append("&");
                }
            }
            
            // Remove last &
            if (queryString.length() > 0) {
                queryString.setLength(queryString.length() - 1);
            }
            
            // Create HMAC SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key1.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
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
            
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            logger.error("[ZaloPayService] Error creating MAC: {}", e.getMessage());
            throw new RuntimeException("Error creating MAC");
        }
    }
}
