package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Coupon;
import com.project.cinema.movie.Models.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    // Tìm coupon theo code
    Optional<Coupon> findByCode(String code);
    
    // Tìm coupon theo code và kiểm tra có thể sử dụng
    @Query("SELECT c FROM Coupon c WHERE c.code = :code AND c.isActive = true AND c.status = :status AND c.remainingQuantity > 0 AND :now BETWEEN c.startDate AND c.endDate")
    Optional<Coupon> findUsableByCode(@Param("code") String code, @Param("status") CouponStatus status, @Param("now") LocalDateTime now);
    
    // Tìm tất cả coupon đang hoạt động
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.status = :status AND :now BETWEEN c.startDate AND c.endDate")
    List<Coupon> findActiveCoupons(@Param("status") CouponStatus status, @Param("now") LocalDateTime now);
    
    // Tìm coupon theo status
    List<Coupon> findByStatus(CouponStatus status);
    
    // Tìm coupon sắp hết hạn (trong 7 ngày tới)
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.status = :status AND c.endDate BETWEEN :now AND :sevenDaysLater")
    List<Coupon> findExpiringSoon(@Param("status") CouponStatus status, @Param("now") LocalDateTime now, @Param("sevenDaysLater") LocalDateTime sevenDaysLater);
    
    // Tìm coupon đã hết hạn
    @Query("SELECT c FROM Coupon c WHERE c.endDate < :now AND c.status = :status")
    List<Coupon> findExpiredCoupons(@Param("now") LocalDateTime now, @Param("status") CouponStatus status);
    
    // Kiểm tra coupon có tồn tại và có thể sử dụng không
    @Query("SELECT COUNT(c) > 0 FROM Coupon c WHERE c.code = :code AND c.isActive = true AND c.status = :status AND c.remainingQuantity > 0 AND :now BETWEEN c.startDate AND c.endDate")
    boolean isCouponUsable(@Param("code") String code, @Param("status") CouponStatus status, @Param("now") LocalDateTime now);
    
    // Tìm coupon theo tên (tìm kiếm)
    @Query("SELECT c FROM Coupon c WHERE c.name LIKE %:name% OR c.description LIKE %:name%")
    List<Coupon> findByNameContaining(@Param("name") String name);
    
    // Đếm số lượng coupon đang hoạt động
    @Query("SELECT COUNT(c) FROM Coupon c WHERE c.isActive = true AND c.status = :status")
    long countActiveCoupons(@Param("status") CouponStatus status);
    
    // Tìm coupon có thể áp dụng cho order amount
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.status = :status AND c.remainingQuantity > 0 AND :now BETWEEN c.startDate AND c.endDate AND c.minimumOrderAmount <= :orderAmount")
    List<Coupon> findApplicableCoupons(@Param("status") CouponStatus status, @Param("now") LocalDateTime now, @Param("orderAmount") Double orderAmount);
}
