package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.CouponDTO;
import com.project.cinema.movie.DTO.CouponValidationDTO;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.CouponRepository;
import com.project.cinema.movie.Repositories.CouponUsageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CouponService {
    
    private static final Logger logger = LoggerFactory.getLogger(CouponService.class);
    
    @Autowired
    private CouponRepository couponRepository;
    
    @Autowired
    private CouponUsageRepository couponUsageRepository;
    
    // Tạo coupon mới
    @Transactional
    public Coupon createCoupon(CouponDTO couponDTO) {
        logger.info("[CouponService] Creating new coupon: {}", couponDTO.getCode());
        
        // Kiểm tra code đã tồn tại chưa
        if (couponRepository.findByCode(couponDTO.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code đã tồn tại: " + couponDTO.getCode());
        }
        
        Coupon coupon = new Coupon(
            couponDTO.getCode(),
            couponDTO.getName(),
            couponDTO.getDescription(),
            couponDTO.getType(),
            couponDTO.getDiscountValue(),
            couponDTO.getMinimumOrderAmount(),
            couponDTO.getMaximumDiscountAmount(),
            couponDTO.getTotalQuantity(),
            couponDTO.getStartDate(),
            couponDTO.getEndDate()
        );
        
        Coupon savedCoupon = couponRepository.save(coupon);
        logger.info("[CouponService] Created coupon successfully: {}", savedCoupon.getId());
        
        return savedCoupon;
    }
    
    // Lấy tất cả coupon
    public List<CouponDTO> getAllCoupons() {
        List<Coupon> coupons = couponRepository.findAll();
        return coupons.stream()
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy coupon theo ID
    public Optional<CouponDTO> getCouponById(Long id) {
        return couponRepository.findById(id)
                .map(CouponDTO::new);
    }
    
    // Lấy coupon theo code
    public Optional<CouponDTO> getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .map(CouponDTO::new);
    }
    
    // Lấy tất cả coupon đang hoạt động
    public List<CouponDTO> getActiveCoupons() {
        List<Coupon> coupons = couponRepository.findActiveCoupons(CouponStatus.ACTIVE, LocalDateTime.now());
        return coupons.stream()
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy coupon có thể áp dụng cho order amount
    public List<CouponDTO> getApplicableCoupons(Double orderAmount) {
        List<Coupon> coupons = couponRepository.findApplicableCoupons(CouponStatus.ACTIVE, LocalDateTime.now(), orderAmount);
        return coupons.stream()
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }
    
    // Validate coupon
    public CouponValidationDTO validateCoupon(String couponCode, Double orderAmount, Long userId) {
        logger.info("[CouponService] Validating coupon: {} for order amount: {} by user: {}", couponCode, orderAmount, userId);
        
        // Tìm coupon
        Optional<Coupon> couponOpt = couponRepository.findUsableByCode(couponCode, CouponStatus.ACTIVE, LocalDateTime.now());
        
        if (couponOpt.isEmpty()) {
            return new CouponValidationDTO(false, "Coupon không tồn tại hoặc đã hết hạn");
        }
        
        Coupon coupon = couponOpt.get();
        
        // Kiểm tra số lượng còn lại
        if (coupon.getRemainingQuantity() <= 0) {
            return new CouponValidationDTO(false, "Coupon đã hết số lượng");
        }
        
        // Kiểm tra user đã sử dụng coupon này chưa
        if (couponUsageRepository.hasUserUsedCoupon(userId, coupon.getId())) {
            return new CouponValidationDTO(false, "Bạn đã sử dụng coupon này rồi");
        }
        
        // Kiểm tra minimum order amount
        if (orderAmount < coupon.getMinimumOrderAmount()) {
            return new CouponValidationDTO(false, 
                String.format("Đơn hàng phải tối thiểu %,.0f VNĐ để sử dụng coupon này", coupon.getMinimumOrderAmount()));
        }
        
        // Tính discount amount
        Double discountAmount = coupon.calculateDiscount(orderAmount);
        Double finalAmount = orderAmount - discountAmount;
        
        logger.info("[CouponService] Coupon validation successful: discount={}, final={}", discountAmount, finalAmount);
        
        return new CouponValidationDTO(true, "Coupon hợp lệ", discountAmount, finalAmount, new CouponDTO(coupon));
    }
    
    // Sử dụng coupon
    @Transactional
    public CouponUsage useCoupon(String couponCode, User user, Booking booking, Double originalAmount) {
        logger.info("[CouponService] Using coupon: {} for booking: {} by user: {} with originalAmount: {}", 
            couponCode, booking.getId(), user.getId(), originalAmount);
        
        try {
            // Validate coupon
            logger.info("[CouponService] Validating coupon: {} with amount: {} for user: {}", 
                couponCode, originalAmount, user.getId());
            
            CouponValidationDTO validation = validateCoupon(couponCode, originalAmount, Long.parseLong(user.getId()));
            if (!validation.isValid()) {
                logger.error("[CouponService] Coupon validation failed: {}", validation.getMessage());
                throw new RuntimeException(validation.getMessage());
            }
            
            logger.info("[CouponService] Coupon validation successful: discountAmount={}, finalAmount={}", 
                validation.getDiscountAmount(), validation.getFinalAmount());
            
            Coupon coupon = couponRepository.findByCode(couponCode).orElseThrow(
                () -> new RuntimeException("Coupon không tồn tại")
            );
            
            // Cập nhật coupon usage count TRƯỚC khi tạo usage record
            logger.info("[CouponService] Before using coupon - Code: {}, Used: {}, Remaining: {}", 
                coupon.getCode(), coupon.getUsedQuantity(), coupon.getRemainingQuantity());
            
            coupon.useCoupon();
            Coupon savedCoupon = couponRepository.save(coupon);
            
            logger.info("[CouponService] After using coupon - Code: {}, Used: {}, Remaining: {}, Status: {}", 
                savedCoupon.getCode(), savedCoupon.getUsedQuantity(), savedCoupon.getRemainingQuantity(), savedCoupon.getStatus());
            
            // Tạo coupon usage record
            CouponUsage usage = new CouponUsage(
                savedCoupon,
                user,
                booking,
                originalAmount,
                validation.getDiscountAmount(),
                validation.getFinalAmount()
            );
            
            // Lưu usage record
            CouponUsage savedUsage = couponUsageRepository.save(usage);
            
            logger.info("[CouponService] Coupon used successfully: {} - Usage ID: {}", savedCoupon.getCode(), savedUsage.getId());
            
            return savedUsage;
            
        } catch (Exception e) {
            logger.error("[CouponService] Error using coupon: {} - {}", couponCode, e.getMessage(), e);
            throw new RuntimeException("Failed to use coupon: " + e.getMessage(), e);
        }
    }
    
    // Cập nhật coupon
    @Transactional
    public Coupon updateCoupon(Long id, CouponDTO couponDTO) {
        logger.info("[CouponService] Updating coupon: {}", id);
        
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon không tồn tại"));
        
        // Cập nhật các trường
        coupon.setName(couponDTO.getName());
        coupon.setDescription(couponDTO.getDescription());
        coupon.setDiscountValue(couponDTO.getDiscountValue());
        coupon.setMinimumOrderAmount(couponDTO.getMinimumOrderAmount());
        coupon.setMaximumDiscountAmount(couponDTO.getMaximumDiscountAmount());
        coupon.setStartDate(couponDTO.getStartDate());
        coupon.setEndDate(couponDTO.getEndDate());
        coupon.setStatus(couponDTO.getStatus());
        coupon.setIsActive(couponDTO.getIsActive());
        
        Coupon updatedCoupon = couponRepository.save(coupon);
        logger.info("[CouponService] Updated coupon successfully: {}", updatedCoupon.getId());
        
        return updatedCoupon;
    }
    
    // Xóa coupon
    @Transactional
    public void deleteCoupon(Long id) {
        logger.info("[CouponService] Deleting coupon: {}", id);
        
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon không tồn tại"));
        
        // Kiểm tra có usage không
        long usageCount = couponUsageRepository.countUsageByCouponId(id);
        if (usageCount > 0) {
            throw new RuntimeException("Không thể xóa coupon đã được sử dụng");
        }
        
        couponRepository.delete(coupon);
        logger.info("[CouponService] Deleted coupon successfully: {}", id);
    }
    
    // Lấy thống kê coupon
    public CouponStatsDTO getCouponStats(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon không tồn tại"));
        
        long usageCount = couponUsageRepository.countUsageByCouponId(couponId);
        
        return new CouponStatsDTO(
            coupon.getId(),
            coupon.getCode(),
            coupon.getName(),
            coupon.getTotalQuantity(),
            (int) usageCount,
            coupon.getRemainingQuantity(),
            coupon.getStatus()
        );
    }
    
    // Lấy coupon sắp hết hạn
    public List<CouponDTO> getExpiringSoonCoupons() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        
        List<Coupon> coupons = couponRepository.findExpiringSoon(CouponStatus.ACTIVE, now, sevenDaysLater);
        return coupons.stream()
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy coupon đã hết hạn
    public List<CouponDTO> getExpiredCoupons() {
        List<Coupon> coupons = couponRepository.findExpiredCoupons(LocalDateTime.now(), CouponStatus.ACTIVE);
        return coupons.stream()
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }
    
    // Tìm kiếm coupon
    public List<CouponDTO> searchCoupons(String keyword) {
        List<Coupon> coupons = couponRepository.findByNameContaining(keyword);
        return coupons.stream()
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }
    
    // Inner class cho stats
    public static class CouponStatsDTO {
        private Long id;
        private String code;
        private String name;
        private Integer totalQuantity;
        private Integer usedQuantity;
        private Integer remainingQuantity;
        private CouponStatus status;
        
        public CouponStatsDTO(Long id, String code, String name, Integer totalQuantity, 
                             Integer usedQuantity, Integer remainingQuantity, CouponStatus status) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.totalQuantity = totalQuantity;
            this.usedQuantity = usedQuantity;
            this.remainingQuantity = remainingQuantity;
            this.status = status;
        }
        
        // Getters
        public Long getId() { return id; }
        public String getCode() { return code; }
        public String getName() { return name; }
        public Integer getTotalQuantity() { return totalQuantity; }
        public Integer getUsedQuantity() { return usedQuantity; }
        public Integer getRemainingQuantity() { return remainingQuantity; }
        public CouponStatus getStatus() { return status; }
    }
}
