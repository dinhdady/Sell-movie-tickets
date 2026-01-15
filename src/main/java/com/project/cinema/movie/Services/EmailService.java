package com.project.cinema.movie.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    private final JavaMailSender mailSender;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    public void sendPasswordChangeOTP(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã OTP đổi mật khẩu - Cinema Booking System");
            message.setText(buildPasswordChangeOTPContent(otp));
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            logger.info("Password change OTP sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send password change OTP to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng thử lại sau.");
        }
    }
    
    public void sendBookingConfirmationWithHtml(String toEmail, String subject, String htmlContent) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(htmlContent); // SimpleMailMessage doesn't support HTML, but we'll use it for now
            message.setFrom(fromEmail);
            
            mailSender.send(message);
            logger.info("Booking confirmation email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send booking confirmation email to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email xác nhận đặt vé. Vui lòng thử lại sau.");
        }
    }
    
    private String buildPasswordChangeOTPContent(String otp) {
        return String.format("""
            Xin chào,
            
            Bạn đã yêu cầu đổi mật khẩu cho tài khoản Cinema Booking System.
            
            Mã OTP của bạn là: %s
            
            Mã OTP này có hiệu lực trong 10 phút.
            
            Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
            
            Trân trọng,
            Cinema Booking System Team
            """, otp);
    }
}