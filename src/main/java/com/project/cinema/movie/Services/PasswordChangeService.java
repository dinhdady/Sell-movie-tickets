package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.ChangePasswordRequest;
import com.project.cinema.movie.DTO.OTPVerificationRequest;
import com.project.cinema.movie.Models.PasswordResetOTP;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Repositories.PasswordResetOTPRepository;
import com.project.cinema.movie.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class PasswordChangeService {
    
    private static final Logger logger = LoggerFactory.getLogger(PasswordChangeService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetOTPRepository otpRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Transactional
    public String requestPasswordChange(String userId, ChangePasswordRequest request) {
        logger.info("Password change request for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }
        
        // Check if new password is different from old password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới phải khác mật khẩu cũ");
        }
        
        // Generate OTP
        String otp = generateOTP();
        
        // Save OTP to database
        PasswordResetOTP otpRecord = new PasswordResetOTP();
        otpRecord.setUser(user);
        otpRecord.setOtp(otp);
        otpRecord.setExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10 minutes expiry
        otpRecord.setIsUsed(false);
        otpRecord.setNewPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        
        otpRepository.save(otpRecord);
        
        // Send OTP via email
        emailService.sendPasswordChangeOTP(user.getEmail(), otp);
        
        logger.info("OTP sent successfully to user: {}", userId);
        
        return user.getEmail();
    }
    
    @Transactional
    public String verifyOTPAndChangePassword(String userId, OTPVerificationRequest request) {
        logger.info("OTP verification for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find valid OTP
        PasswordResetOTP otpRecord = otpRepository.findValidOTP(user, request.getOtp(), LocalDateTime.now())
            .orElseThrow(() -> new RuntimeException("OTP không hợp lệ hoặc đã hết hạn"));
        
        // Mark OTP as used
        otpRecord.setIsUsed(true);
        otpRepository.save(otpRecord);
        
        // Update password
        user.setPassword(otpRecord.getNewPasswordHash());
        userRepository.save(user);
        
        logger.info("Password changed successfully for user: {}", userId);
        
        return "Mật khẩu đã được đổi thành công";
    }
    
    @Transactional
    public String resendOTP(String userId) {
        logger.info("Resend OTP request for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find latest valid OTP
        PasswordResetOTP existingOTP = otpRepository.findLatestValidOTP(user, LocalDateTime.now())
            .orElseThrow(() -> new RuntimeException("Không có yêu cầu đổi mật khẩu nào đang chờ xử lý"));
        
        // Generate new OTP
        String newOtp = generateOTP();
        existingOTP.setOtp(newOtp);
        existingOTP.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        
        otpRepository.save(existingOTP);
        
        // Send new OTP via email
        emailService.sendPasswordChangeOTP(user.getEmail(), newOtp);
        
        logger.info("New OTP sent successfully to user: {}", userId);
        
        return "OTP mới đã được gửi đến email của bạn";
    }
    
    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }
}
