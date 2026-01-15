package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.CouponDTO;
import com.project.cinema.movie.DTO.CouponValidationDTO;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.CouponService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupon")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5177", "http://127.0.0.1:5177"}, allowCredentials = "true")
public class CouponController {
    
    private static final Logger logger = LoggerFactory.getLogger(CouponController.class);
    
    @Autowired
    private CouponService couponService;
    
    // Lấy tất cả coupon (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ResponseObject> getAllCoupons() {
        try {
            List<CouponDTO> coupons = couponService.getAllCoupons();
            return ResponseEntity.ok(new ResponseObject("200", "Coupons retrieved successfully!", coupons));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting all coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving coupons: " + e.getMessage(), null));
        }
    }
    
    // Lấy coupon theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getCouponById(@PathVariable Long id) {
        try {
            return couponService.getCouponById(id)
                .map(coupon -> ResponseEntity.ok(new ResponseObject("200", "Coupon retrieved successfully!", coupon)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("404", "Coupon not found!", null)));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting coupon by ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving coupon: " + e.getMessage(), null));
        }
    }
    
    // Lấy coupon theo code
    @GetMapping("/code/{code}")
    public ResponseEntity<ResponseObject> getCouponByCode(@PathVariable String code) {
        try {
            return couponService.getCouponByCode(code)
                .map(coupon -> ResponseEntity.ok(new ResponseObject("200", "Coupon retrieved successfully!", coupon)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("404", "Coupon not found!", null)));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting coupon by code {}: {}", code, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving coupon: " + e.getMessage(), null));
        }
    }
    
    // Lấy coupon đang hoạt động
    @GetMapping("/active")
    public ResponseEntity<ResponseObject> getActiveCoupons() {
        try {
            List<CouponDTO> coupons = couponService.getActiveCoupons();
            return ResponseEntity.ok(new ResponseObject("200", "Active coupons retrieved successfully!", coupons));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting active coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving active coupons: " + e.getMessage(), null));
        }
    }
    
    // Lấy coupon có thể áp dụng
    @GetMapping("/applicable")
    public ResponseEntity<ResponseObject> getApplicableCoupons(@RequestParam Double orderAmount) {
        try {
            List<CouponDTO> coupons = couponService.getApplicableCoupons(orderAmount);
            return ResponseEntity.ok(new ResponseObject("200", "Applicable coupons retrieved successfully!", coupons));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting applicable coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving applicable coupons: " + e.getMessage(), null));
        }
    }
    
    // Validate coupon
    @PostMapping("/validate")
    public ResponseEntity<ResponseObject> validateCoupon(@RequestBody CouponValidationRequest request) {
        try {
            logger.info("[CouponController] Validating coupon: {} for order amount: {} by user: {}", 
                request.getCouponCode(), request.getOrderAmount(), request.getUserId());
            
            CouponValidationDTO validation = couponService.validateCoupon(
                request.getCouponCode(), 
                request.getOrderAmount(), 
                request.getUserId()
            );
            
            return ResponseEntity.ok(new ResponseObject("200", "Coupon validation completed!", validation));
        } catch (Exception e) {
            logger.error("[CouponController] Error validating coupon: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Coupon validation failed: " + e.getMessage(), null));
        }
    }
    
    // Tạo coupon mới (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ResponseObject> createCoupon(@RequestBody CouponDTO couponDTO) {
        try {
            logger.info("[CouponController] Creating new coupon: {}", couponDTO.getCode());
            
            var coupon = couponService.createCoupon(couponDTO);
            CouponDTO createdCoupon = new CouponDTO(coupon);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject("201", "Coupon created successfully!", createdCoupon));
        } catch (Exception e) {
            logger.error("[CouponController] Error creating coupon: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error creating coupon: " + e.getMessage(), null));
        }
    }
    
    // Cập nhật coupon (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateCoupon(@PathVariable Long id, @RequestBody CouponDTO couponDTO) {
        try {
            logger.info("[CouponController] Updating coupon: {}", id);
            
            var coupon = couponService.updateCoupon(id, couponDTO);
            CouponDTO updatedCoupon = new CouponDTO(coupon);
            
            return ResponseEntity.ok(new ResponseObject("200", "Coupon updated successfully!", updatedCoupon));
        } catch (Exception e) {
            logger.error("[CouponController] Error updating coupon: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating coupon: " + e.getMessage(), null));
        }
    }
    
    // Xóa coupon (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObject> deleteCoupon(@PathVariable Long id) {
        try {
            logger.info("[CouponController] Deleting coupon: {}", id);
            
            couponService.deleteCoupon(id);
            
            return ResponseEntity.ok(new ResponseObject("200", "Coupon deleted successfully!", null));
        } catch (Exception e) {
            logger.error("[CouponController] Error deleting coupon: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error deleting coupon: " + e.getMessage(), null));
        }
    }
    
    // Lấy thống kê coupon (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/stats")
    public ResponseEntity<ResponseObject> getCouponStats(@PathVariable Long id) {
        try {
            var stats = couponService.getCouponStats(id);
            return ResponseEntity.ok(new ResponseObject("200", "Coupon stats retrieved successfully!", stats));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting coupon stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error getting coupon stats: " + e.getMessage(), null));
        }
    }
    
    // Lấy coupon sắp hết hạn (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/expiring-soon")
    public ResponseEntity<ResponseObject> getExpiringSoonCoupons() {
        try {
            List<CouponDTO> coupons = couponService.getExpiringSoonCoupons();
            return ResponseEntity.ok(new ResponseObject("200", "Expiring soon coupons retrieved successfully!", coupons));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting expiring soon coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving expiring soon coupons: " + e.getMessage(), null));
        }
    }
    
    // Lấy coupon đã hết hạn (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/expired")
    public ResponseEntity<ResponseObject> getExpiredCoupons() {
        try {
            List<CouponDTO> coupons = couponService.getExpiredCoupons();
            return ResponseEntity.ok(new ResponseObject("200", "Expired coupons retrieved successfully!", coupons));
        } catch (Exception e) {
            logger.error("[CouponController] Error getting expired coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving expired coupons: " + e.getMessage(), null));
        }
    }
    
    // Tìm kiếm coupon
    @GetMapping("/search")
    public ResponseEntity<ResponseObject> searchCoupons(@RequestParam String keyword) {
        try {
            List<CouponDTO> coupons = couponService.searchCoupons(keyword);
            return ResponseEntity.ok(new ResponseObject("200", "Search results retrieved successfully!", coupons));
        } catch (Exception e) {
            logger.error("[CouponController] Error searching coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error searching coupons: " + e.getMessage(), null));
        }
    }
    
    // Inner class cho request
    public static class CouponValidationRequest {
        private String couponCode;
        private Double orderAmount;
        private Long userId;
        
        // Constructors
        public CouponValidationRequest() {}
        
        public CouponValidationRequest(String couponCode, Double orderAmount, Long userId) {
            this.couponCode = couponCode;
            this.orderAmount = orderAmount;
            this.userId = userId;
        }
        
        // Getters and Setters
        public String getCouponCode() { return couponCode; }
        public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
        
        public Double getOrderAmount() { return orderAmount; }
        public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }

    // Test endpoint để verify coupon usage
    @GetMapping("/test-usage/{code}")
    public ResponseEntity<ResponseObject> testCouponUsage(@PathVariable String code) {
        try {
            return couponService.getCouponByCode(code)
                .map(coupon -> ResponseEntity.ok(new ResponseObject("SUCCESS", "Coupon usage info", Map.of(
                    "code", coupon.getCode(),
                    "name", coupon.getName(),
                    "usedQuantity", coupon.getUsedQuantity(),
                    "remainingQuantity", coupon.getRemainingQuantity(),
                    "totalQuantity", coupon.getTotalQuantity(),
                    "status", coupon.getStatus()
                ))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("ERROR", "Coupon not found: " + code, null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("ERROR", "Error getting coupon usage: " + e.getMessage(), null));
        }
    }
}
