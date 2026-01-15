package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.EmailVerificationToken;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Repositories.EmailVerificationTokenRepository;
import com.project.cinema.movie.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    private static final int TOKEN_EXPIRY_HOURS = 24;

    @Transactional
    public String generateVerificationToken(User user) {
        // Xóa token cũ nếu có
        emailVerificationTokenRepository.deleteByUserId(user.getId());
        
        // Tạo token mới
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS);
        
        EmailVerificationToken verificationToken = new EmailVerificationToken(token, user, expiryDate);
        emailVerificationTokenRepository.save(verificationToken);
        
        return token;
    }

    @Transactional
    public boolean verifyToken(String token) {
        Optional<EmailVerificationToken> tokenOptional = emailVerificationTokenRepository.findByToken(token);
        
        if (tokenOptional.isPresent()) {
            EmailVerificationToken verificationToken = tokenOptional.get();
            
            if (verificationToken.isValid()) {
                // Đánh dấu token đã sử dụng
                verificationToken.setUsed(true);
                verificationToken.setVerifiedAt(LocalDateTime.now());
                emailVerificationTokenRepository.save(verificationToken);
                
                // Cập nhật user đã verify email
                User user = verificationToken.getUser();
                user.setEmailVerified(true);
                userRepository.save(user);
                
                return true;
            }
        }
        
        return false;
    }

    public void sendVerificationEmail(String email, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Xác thực tài khoản - Cinema Movie Tickets");
            
            String verificationUrl = "http://localhost:5173/verify-email?token=" + token;
            
            String emailContent = String.format("""
                Xin chào!
                
                Cảm ơn bạn đã đăng ký tài khoản tại Cinema Movie Tickets.
                
                Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn bằng cách click vào link bên dưới:
                
                %s
                
                Hoặc bạn có thể sử dụng mã xác thực sau:
                %s
                
                Mã xác thực này sẽ hết hạn sau 24 giờ.
                
                Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
                
                Trân trọng,
                Đội ngũ Cinema Movie Tickets
                """, verificationUrl, token);
            
            message.setText(emailContent);
            mailSender.send(message);
            
            System.out.println("[EmailVerificationService] Verification email sent to: " + email);
        } catch (Exception e) {
            System.err.println("[EmailVerificationService] Error sending verification email: " + e.getMessage());
            throw new RuntimeException("Không thể gửi email xác thực: " + e.getMessage());
        }
    }

    @Transactional
    public boolean resendVerificationEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            if (user.isEmailVerified()) {
                return false; // Email đã được verify
            }
            
            // Tạo token mới và gửi email
            String token = generateVerificationToken(user);
            sendVerificationEmail(email, token);
            return true;
        }
        
        return false; // User không tồn tại
    }

    public void cleanupExpiredTokens() {
        emailVerificationTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        System.out.println("[EmailVerificationService] Cleaned up expired tokens");
    }

    public boolean isEmailVerified(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.map(User::isEmailVerified).orElse(false);
    }

    public Optional<EmailVerificationToken> getTokenByEmail(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            return emailVerificationTokenRepository.findByUserId(userOptional.get().getId());
        }
        return Optional.empty();
    }
}
