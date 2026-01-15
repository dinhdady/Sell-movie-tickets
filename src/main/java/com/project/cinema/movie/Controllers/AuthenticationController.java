package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.*;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.PasswordResetTokenRepository;
import com.project.cinema.movie.Services.AuthenticationService;
import com.project.cinema.movie.Services.EmailVerificationService;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;


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
    @Autowired
    private EmailVerificationService emailVerificationService;
    @Value("${google.oauth.client-id}")
    private String googleClientId;

    @Value("${google.oauth.client-secret}")
    private String googleClientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String googleRedirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

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

            if (userService.findByEmail(registerRequest.getEmail()).isPresent()) {
                logger.warn("Email '{}' is already in use", registerRequest.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ResponseObject("FAILED", "Email already exists", null));
            }

            if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
                logger.warn("Password is null or empty for username: {}", registerRequest.getUsername());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Password cannot be null or empty", null));
            }

            // Đăng ký user (với isEmailVerified = false)
            User user = userService.register(registerRequest);
            logger.info("User '{}' registered successfully", registerRequest.getUsername());

            // Tạo và gửi email verification
            String verificationToken = emailVerificationService.generateVerificationToken(user);
            emailVerificationService.sendVerificationEmail(user.getEmail(), verificationToken);
            logger.info("Verification email sent to: {}", user.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseObject("SUCCESS", "User registered successfully. Please check your email to verify your account.", Map.of(
                        "email", user.getEmail(),
                        "verificationRequired", true
                    )));
        } catch (Exception e) {
            logger.error("Error during user registration for username '{}'", registerRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Registration failed: " + e.getMessage(), null));
        }
    }
    @PostMapping("/google/exchange")
    public ResponseEntity<ResponseObject> exchangeGoogleCode(@RequestBody GoogleCodeRequest req) {
        try {
            if (req.getCode() == null || req.getCode().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new ResponseObject("FAILED", "Missing authorization code", null));
            }

            // ✅ ưu tiên redirectUri FE gửi lên để tránh mismatch localhost/IP
            String redirectUri = (req.getRedirectUri() != null && !req.getRedirectUri().isBlank())
                    ? req.getRedirectUri()
                    : googleRedirectUri;

            // 1) Exchange code -> token
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("code", req.getCode());
            form.add("client_id", googleClientId);
            form.add("client_secret", googleClientSecret);
            form.add("redirect_uri", redirectUri);
            form.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);

            ResponseEntity<GoogleTokenResponse> tokenRes = restTemplate.postForEntity(
                    "https://oauth2.googleapis.com/token",
                    entity,
                    GoogleTokenResponse.class
            );

            GoogleTokenResponse tr = tokenRes.getBody();
            if (tr == null || tr.id_token == null || tr.id_token.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Google did not return id_token", null));
            }

            // 2) Get email from id_token
            ResponseEntity<Map> infoRes = restTemplate.getForEntity(
                    "https://oauth2.googleapis.com/tokeninfo?id_token=" + tr.id_token,
                    Map.class
            );

            Map info = infoRes.getBody();
            String email = info == null ? null : (String) info.get("email");
            String name  = info == null ? null : (String) info.get("name");

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Cannot read email from Google token", null));
            }

            // 3) Find or create local user
            User user = userService.findByEmail(email).orElse(null);

            if (user == null) {
                RegisterRequest rr = new RegisterRequest();
                rr.setEmail(email);

                // ✅ Tạo username từ phần trước dấu @ của email
                String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
                String username = base;
                
                // ✅ Kiểm tra nếu username đã tồn tại thì thêm UUID
                if (userService.findByUsername(username).isPresent()) {
                    String uuid = UUID.randomUUID().toString().substring(0, 8);
                    username = base + "_" + uuid;
                }
                
                rr.setUsername(username);

                // password random (user không dùng để login thường)
                rr.setPassword(UUID.randomUUID().toString());

                // ✅ Set họ và tên từ Google
                if (name != null && !name.isBlank()) {
                    rr.setFullName(name);
                }

                user = userService.register(rr);

                // ✅ Google coi như verified
                user.setIsEmailVerified(true);
                userService.save(user); // nếu UserService bạn có save(); nếu không có thì thay bằng userRepository.save(user)
            } else {
                // ✅ nếu user tồn tại nhưng chưa verified, cho verified luôn (tuỳ bạn)
                if (user.getIsEmailVerified() == null || !user.getIsEmailVerified()) {
                    user.setIsEmailVerified(true);
                }
                
                // ✅ Cập nhật họ và tên từ Google nếu chưa có hoặc cần cập nhật
                if (name != null && !name.isBlank() && 
                    (user.getFullName() == null || user.getFullName().isBlank())) {
                    user.setFullName(name);
                }
                
                userService.save(user);
            }

            // 4) Generate app JWT using AuthenticationService
            AuthenticationResponse auth = authenticationService.generateTokensForUser(user);

            if (auth == null || !auth.isSuccess()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ResponseObject("FAILED", "Token generation failed", null));
            }

            return ResponseEntity.ok(new ResponseObject("SUCCESS", "Google login success", auth));

        } catch (HttpStatusCodeException e) {
            logger.error("Google exchange error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("FAILED", "Google exchange error: " + e.getResponseBodyAsString(), null));
        } catch (Exception e) {
            logger.error("Google exchange failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Failed: " + e.getMessage(), null));
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

                AuthenticationResponse authResponse = new AuthenticationResponse(true, newAccessToken, refreshToken, "Success", user.get());
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
     * Verify email with token
     * @param request the verification request containing token
     * @return ResponseEntity with verification status
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ResponseObject> verifyEmail(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("FAILED", "Token is required", null));
        }
        
        try {
            boolean isVerified = emailVerificationService.verifyToken(token);
            
            if (isVerified) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body(new ResponseObject("SUCCESS", "Email verified successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Invalid or expired token", null));
            }
        } catch (Exception e) {
            logger.error("Error verifying email token", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Error verifying email: " + e.getMessage(), null));
        }
    }

    /**
     * Resend verification email
     * @param request the resend request containing email
     * @return ResponseEntity with resend status
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ResponseObject> resendVerificationEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseObject("FAILED", "Email is required", null));
        }
        
        try {
            boolean resendSuccess = emailVerificationService.resendVerificationEmail(email);
            
            if (resendSuccess) {
                return ResponseEntity.status(HttpStatus.OK)
                        .body(new ResponseObject("SUCCESS", "Verification email sent successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseObject("FAILED", "Email not found or already verified", null));
            }
        } catch (Exception e) {
            logger.error("Error resending verification email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Error resending verification email: " + e.getMessage(), null));
        }
    }

    /**
     * Check email verification status
     * @param email the email to check
     * @return ResponseEntity with verification status
     */
    @GetMapping("/check-email-verification")
    public ResponseEntity<ResponseObject> checkEmailVerification(@RequestParam String email) {
        try {
            boolean isVerified = emailVerificationService.isEmailVerified(email);
            
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ResponseObject("SUCCESS", "Email verification status retrieved", Map.of(
                        "email", email,
                        "isVerified", isVerified
                    )));
        } catch (Exception e) {
            logger.error("Error checking email verification status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseObject("FAILED", "Error checking email verification: " + e.getMessage(), null));
        }
    }
}