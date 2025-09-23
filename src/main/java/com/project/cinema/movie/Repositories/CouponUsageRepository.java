package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.CouponUsage;
import com.project.cinema.movie.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    
    // Tìm usage theo user
    List<CouponUsage> findByUser(User user);
    
    // Tìm usage theo coupon
    List<CouponUsage> findByCouponId(Long couponId);
    
    // Kiểm tra user đã sử dụng coupon này chưa
    @Query("SELECT COUNT(cu) > 0 FROM CouponUsage cu WHERE cu.user.id = :userId AND cu.coupon.id = :couponId")
    boolean hasUserUsedCoupon(@Param("userId") Long userId, @Param("couponId") Long couponId);
    
    // Đếm số lần sử dụng coupon
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    long countUsageByCouponId(@Param("couponId") Long couponId);
    
    // Tìm usage trong khoảng thời gian
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.usedAt BETWEEN :startDate AND :endDate")
    List<CouponUsage> findByUsedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Tìm usage theo user trong khoảng thời gian
    @Query("SELECT cu FROM CouponUsage cu WHERE cu.user.id = :userId AND cu.usedAt BETWEEN :startDate AND :endDate")
    List<CouponUsage> findByUserAndUsedAtBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
