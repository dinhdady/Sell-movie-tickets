package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.ChangePasswordRequest;
import com.project.cinema.movie.DTO.OTPVerificationRequest;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.PasswordChangeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class PasswordChangeController {
    
    private static final Logger logger = LoggerFactory.getLogger(PasswordChangeController.class);
    
    @Autowired
    private PasswordChangeService passwordChangeService;
    
    // Request password change (sends OTP)
    @PostMapping("/change-password-request")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> requestPasswordChange(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            logger.info("Password change request for user: {}", userId);
            String email = passwordChangeService.requestPasswordChange(userId, request);
            return ResponseEntity.ok(new ResponseObject("200", "OTP đã được gửi đến email của bạn", 
                new PasswordChangeResponse(email, true)));
        } catch (Exception e) {
            logger.error("Error requesting password change: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", e.getMessage(), null));
        }
    }
    
    // Verify OTP and change password
    @PostMapping("/change-password-verify")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> verifyOTPAndChangePassword(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody OTPVerificationRequest request) {
        try {
            logger.info("OTP verification for user: {}", userId);
            String message = passwordChangeService.verifyOTPAndChangePassword(userId, request);
            return ResponseEntity.ok(new ResponseObject("200", message, null));
        } catch (Exception e) {
            logger.error("Error verifying OTP: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", e.getMessage(), null));
        }
    }
    
    // Resend OTP
    @PostMapping("/resend-otp")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ResponseObject> resendOTP(@RequestHeader("X-User-Id") String userId) {
        try {
            logger.info("Resend OTP request for user: {}", userId);
            String message = passwordChangeService.resendOTP(userId);
            return ResponseEntity.ok(new ResponseObject("200", message, null));
        } catch (Exception e) {
            logger.error("Error resending OTP: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", e.getMessage(), null));
        }
    }
    
    // Response DTO for password change request
    public static class PasswordChangeResponse {
        private String email;
        private boolean otpSent;
        
        public PasswordChangeResponse(String email, boolean otpSent) {
            this.email = email;
            this.otpSent = otpSent;
        }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public boolean isOtpSent() { return otpSent; }
        public void setOtpSent(boolean otpSent) { this.otpSent = otpSent; }
    }
}
