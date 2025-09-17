package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.*;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.PasswordResetTokenRepository;
import com.project.cinema.movie.Services.AuthenticationService;
import com.project.cinema.movie.Services.JwtService;
import com.project.cinema.movie.Services.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Validated
@CrossOrigin(origins = "*")
public class AuthenticationController {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);
    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Autowired
    private JavaMailSender mailSender;

    /**
     * User registration handler
     * @param registerRequest the registration request payload
     * @return ResponseEntity with registration status
     */
    @PostMapping("/register")
    public ResponseEntity<ResponseObject> register(@RequestBody @Validated RegisterRequest registerRequest) {
        logger.info("User attempting to register: {}", registerRequest.getUsername());

        try {
            if (userService.findByUsername(registerRequest.getUsername()).isPresent()) {
                logger.warn("Username '{}' is already in use", registerRequest.getUsername());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ResponseObject("FAILED", "Username already exists", null));
            }

            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                logger.warn("Password is null or empty for username: {}", registerRequest.getUsername());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Password cannot be null or empty", null));
            }

            userService.register(registerRequest);
            logger.info("User '{}' registered successfully", registerRequest.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseObject("SUCCESS", "User registered successfully", null));
        } catch (Exception e) {
            logger.error("Error during user registration for username '{}'", registerRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Registration failed: " + e.getMessage(), null));
        }
    }

    /**
     * User login handler
     * @param authRequest the login request payload
     * @return ResponseEntity with login status and JWT tokens
     */
    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(@RequestBody @Validated AuthRequest authRequest, 
                                               HttpServletResponse httpServletResponse, 
                                               HttpSession httpSession) {
        try {
            AuthenticationResponse authResponse = authenticationService.authenticate(authRequest, httpServletResponse, httpSession);

            if (authResponse.isSuccess()) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body(new ResponseObject("SUCCESS", authResponse.getMessage(), authResponse));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseObject("FAILED", authResponse.getMessage(), null));
            }
        } catch (Exception e) {
            logger.error("Error during login for username '{}'", authRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Login failed: " + e.getMessage(), null));
        }
    }

    /**
     * User logout handler
     * @return ResponseEntity with logout status
     */
    @PostMapping("/logout")
    public ResponseEntity<ResponseObject> logout(HttpServletResponse httpServletResponse, HttpSession httpSession) {
        try {
            // Clear session
            if (httpSession != null) {
                httpSession.invalidate();
            }
            // Không cần clear cookie nữa
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ResponseObject("SUCCESS", "Logout successful", null));
        } catch (Exception e) {
            logger.error("Error during logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Logout failed: " + e.getMessage(), null));
        }
    }

    /**
     * Refresh JWT access token using a refresh token
     * @param request the refresh token request
     * @return ResponseEntity with the new access token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ResponseObject> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        logger.info("Refreshing token with provided refreshToken: {}", refreshToken);

        try {
            if (jwtService.verifyToken(refreshToken)) {
                String username = jwtService.extractUsername(refreshToken);
                Optional<User> user = userService.findByUsername(username);

                if (user.isEmpty()) {
                    logger.warn("No user found for username: {}", username);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new ResponseObject("FAILED", "User not found", null));
                }

                String newAccessToken = jwtService.generateAccessToken(user.get());
                logger.info("Generated new accessToken for username: {}", username);

                AuthenticationResponse authResponse = new AuthenticationResponse(true, newAccessToken, refreshToken, "Success");
                return ResponseEntity.status(HttpStatus.OK)
                        .body(new ResponseObject("SUCCESS", "Token refreshed successfully", authResponse));
            } else {
                logger.warn("Invalid refresh token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseObject("FAILED", "Invalid refresh token", null));
            }
        } catch (Exception e) {
            logger.error("Error refreshing token: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Internal server error during token refresh", null));
        }
    }

    /**
     * Forgot password handler
     * @param request the forgot password request containing email
     * @return ResponseEntity with password reset status
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseObject> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("FAILED", "Email is required", null));
        }
        
        try {
            // Kiểm tra email có tồn tại không
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

            // Tạo token
            String token = UUID.randomUUID().toString();
            PasswordResetToken passwordResetToken = new PasswordResetToken();
            passwordResetToken.setToken(token);
            passwordResetToken.setUser(user);
            passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(1)); // Token hết hạn sau 1 giờ
            passwordResetTokenRepository.save(passwordResetToken);

            // Gửi email chứa link đặt lại mật khẩu
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            String emailBody = "Để đặt lại mật khẩu, vui lòng nhấp vào link sau: " + resetLink;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Yêu cầu đặt lại mật khẩu");
            message.setText(emailBody);
            mailSender.send(message);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ResponseObject("SUCCESS", "Email đặt lại mật khẩu đã được gửi", null));
        } catch (RuntimeException e) {
            logger.warn("Forgot password error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("FAILED", e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error in forgot password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Failed to send reset email: " + e.getMessage(), null));
        }
    }

    /**
     * Reset password handler
     * @param request the reset password request containing token, newPassword, and confirmPassword
     * @return ResponseEntity with password reset status
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ResponseObject> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        
        if (token == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("FAILED", "Token, newPassword, and confirmPassword are required", null));
        }
        
        try {
            // Kiểm tra token có hợp lệ không
            PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));

            // Kiểm tra token đã hết hạn chưa
            if (passwordResetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token đã hết hạn");
            }

            if (!newPassword.equals(confirmPassword) || newPassword.length() <= 6) {
                throw new RuntimeException("Password mới không hợp lệ!");
            }

            User user = passwordResetToken.getUser();
            user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
            userService.save(user);

            passwordResetTokenRepository.delete(passwordResetToken);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ResponseObject("SUCCESS", "Mật khẩu đã được đặt lại thành công", null));
        } catch (RuntimeException e) {
            logger.warn("Reset password error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("FAILED", e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error in reset password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Failed to reset password: " + e.getMessage(), null));
        }
    }

    /**
     * Validate reset token
     * @param token the reset token to validate
     * @return ResponseEntity with token validation status
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<ResponseObject> validateResetToken(@RequestParam String token) {
        try {
            Optional<PasswordResetToken> resetToken = passwordResetTokenRepository.findByToken(token);
            
            if (resetToken.isPresent() && resetToken.get().getExpiryDate().isAfter(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body(new ResponseObject("SUCCESS", "Token is valid", null));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Token is invalid or expired", null));
            }
        } catch (Exception e) {
            logger.error("Error validating reset token", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Error validating token", null));
        }
    }

    /**
     * Create admin user for testing purposes
     * @param registerRequest the registration request payload
     * @return ResponseEntity with admin creation status
     */
    @PostMapping("/create-admin")
    public ResponseEntity<ResponseObject> createAdmin(@RequestBody @Validated RegisterRequest registerRequest) {
        logger.info("Creating admin user: {}", registerRequest.getUsername());

        try {
            if (userService.findByUsername(registerRequest.getUsername()).isPresent()) {
                logger.warn("Username '{}' is already in use", registerRequest.getUsername());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ResponseObject("FAILED", "Username already exists", null));
            }

            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                logger.warn("Password is null or empty for username: {}", registerRequest.getUsername());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Password cannot be null or empty", null));
            }

            // Create admin user with ADMIN role
            User adminUser = new User();
            adminUser.setUsername(registerRequest.getUsername());
            adminUser.setPassword(new BCryptPasswordEncoder().encode(registerRequest.getPassword()));
            adminUser.setEmail(registerRequest.getEmail());
            adminUser.setFullName(registerRequest.getFullName() != null ? registerRequest.getFullName() : registerRequest.getUsername());
            adminUser.setRole(Role.ADMIN);
            
            userService.save(adminUser);
            logger.info("Admin user '{}' created successfully", registerRequest.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseObject("SUCCESS", "Admin user created successfully", null));
        } catch (Exception e) {
            logger.error("Error during admin user creation for username '{}'", registerRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Admin creation failed: " + e.getMessage(), null));
        }
    }

    /**
     * Initialize default admin user
     * @return ResponseEntity with initialization status
     */
    @PostMapping("/init-admin")
    public ResponseEntity<ResponseObject> initializeAdmin() {
        logger.info("Initializing default admin user");

        try {
            // Kiểm tra admin đã tồn tại chưa
            if (userService.findByUsername("admin").isPresent()) {
                logger.info("Admin user already exists");
                return ResponseEntity.status(HttpStatus.OK)
                        .body(new ResponseObject("SUCCESS", "Admin user already exists", null));
            }

            // Tạo admin mặc định
            RegisterRequest adminRequest = new RegisterRequest();
            adminRequest.setUsername("admin");
            adminRequest.setEmail("admin@cinema.com");
            adminRequest.setPassword("admin123");
            
            userService.registerAdmin(adminRequest);
            logger.info("Default admin user created successfully");

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseObject("SUCCESS", "Default admin user created successfully", null));
        } catch (Exception e) {
            logger.error("Error creating default admin user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Failed to create default admin: " + e.getMessage(), null));
        }
    }
}