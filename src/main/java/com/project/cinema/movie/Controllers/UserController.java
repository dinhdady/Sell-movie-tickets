package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Services.BookingService;
import com.project.cinema.movie.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookingService bookingService;

    // Lấy thông tin người dùng hiện tại
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/profile")
    public ResponseEntity<ResponseObject> getCurrentUser(Authentication authentication) {
        try {
            User currentUser = userService.getCurrentUser(authentication);
            return ResponseEntity.ok(new ResponseObject("200", "User profile retrieved successfully!", currentUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving user profile: " + e.getMessage(), null));
        }
    }

    // Lấy profile người dùng chi tiết
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{userId}/profile")
    public ResponseEntity<ResponseObject> getUserProfile(@PathVariable String userId) {
        try {
            Map<String, Object> userProfile = userService.getUserProfile(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User profile retrieved successfully!", userProfile));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving user profile: " + e.getMessage(), null));
        }
    }

    // Cập nhật thông tin người dùng
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PutMapping("/{userId}/profile")
    public ResponseEntity<ResponseObject> updateUserProfile(
            @PathVariable String userId,
            @RequestBody Map<String, Object> updateDto,
            Authentication authentication) {
        try {
            User updatedUser = userService.updateUserProfile(userId, updateDto, authentication);
            return ResponseEntity.ok(new ResponseObject("200", "User profile updated successfully!", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating user profile: " + e.getMessage(), null));
        }
    }

    // Đổi mật khẩu
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @PostMapping("/change-password")
    public ResponseEntity<ResponseObject> changePassword(
            @RequestBody Map<String, String> passwordDto,
            Authentication authentication) {
        try {
            userService.changePassword(passwordDto, authentication);
            return ResponseEntity.ok(new ResponseObject("200", "Password changed successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error changing password: " + e.getMessage(), null));
        }
    }

    // Lấy lịch sử đặt vé của người dùng
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{userId}/bookings")
    public ResponseEntity<ResponseObject> getUserBookingHistory(
            @PathVariable String userId,
            Authentication authentication) {
        try {
            // Kiểm tra xem user có quyền xem bookings của userId này không
            // Admin có thể xem tất cả, user chỉ có thể xem của chính mình
            User currentUser = userService.getCurrentUser(authentication);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseObject("401", "User not authenticated", null));
            }
            
            // Nếu không phải admin và userId không khớp với user hiện tại, từ chối
            if (!currentUser.getRole().name().equals("ADMIN") && !currentUser.getId().toString().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResponseObject("403", "You can only view your own bookings", null));
            }
            
            List<BookingDetailsResponse> bookings = bookingService.getUserBookingHistory(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User booking history retrieved successfully!", bookings));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving booking history: " + e.getMessage(), null));
        }
    }

    // Lấy lịch sử thanh toán của người dùng
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{userId}/payments")
    public ResponseEntity<ResponseObject> getUserPaymentHistory(@PathVariable String userId) {
        try {
            List<Map<String, Object>> payments = userService.getUserPaymentHistory(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User payment history retrieved successfully!", payments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving payment history: " + e.getMessage(), null));
        }
    }

    // Lấy thống kê người dùng
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    @GetMapping("/{userId}/stats")
    public ResponseEntity<ResponseObject> getUserStats(@PathVariable String userId) {
        try {
            Map<String, Object> stats = userService.getUserStats(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User statistics retrieved successfully!", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving user statistics: " + e.getMessage(), null));
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    // Lấy danh sách tất cả người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<ResponseObject> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(new ResponseObject("200", "All users retrieved successfully!", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving users: " + e.getMessage(), null));
        }
    }

    // Admin endpoints - Tạo người dùng mới
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/create")
    public ResponseEntity<ResponseObject> createUser(@RequestBody Map<String, Object> userData) {
        try {
            User newUser = userService.createUser(userData);
            return ResponseEntity.ok(new ResponseObject("200", "User created successfully!", newUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error creating user: " + e.getMessage(), null));
        }
    }

    // Admin endpoints - Cập nhật người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{userId}")
    public ResponseEntity<ResponseObject> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> userData) {
        try {
            User updatedUser = userService.updateUser(userId, userData);
            return ResponseEntity.ok(new ResponseObject("200", "User updated successfully!", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error updating user: " + e.getMessage(), null));
        }
    }

    // Lấy người dùng theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{userId}")
    public ResponseEntity<ResponseObject> getUserById(@PathVariable String userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User retrieved successfully!", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ResponseObject("404", "User not found: " + e.getMessage(), null));
        }
    }

    // Cập nhật vai trò người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{userId}/role")
    public ResponseEntity<ResponseObject> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> roleDto) {
        try {
            User updatedUser = userService.updateUserRole(userId, roleDto.get("role"));
            return ResponseEntity.ok(new ResponseObject("200", "User role updated successfully!", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating user role: " + e.getMessage(), null));
        }
    }

    // Kích hoạt/Vô hiệu hóa người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{userId}/status")
    public ResponseEntity<ResponseObject> toggleUserStatus(
            @PathVariable String userId,
            @RequestBody Map<String, Boolean> statusDto) {
        try {
            User updatedUser = userService.toggleUserStatus(userId, statusDto.get("isActive"));
            return ResponseEntity.ok(new ResponseObject("200", "User status updated successfully!", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating user status: " + e.getMessage(), null));
        }
    }

    // Xóa người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{userId}")
    public ResponseEntity<ResponseObject> deleteUser(@PathVariable String userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(new ResponseObject("200", "User deleted successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error deleting user: " + e.getMessage(), null));
        }
    }

    // Lấy thống kê người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/stats")
    public ResponseEntity<ResponseObject> getUsersStats() {
        try {
            Map<String, Object> stats = userService.getUsersStats();
            return ResponseEntity.ok(new ResponseObject("200", "Users statistics retrieved successfully!", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving users statistics: " + e.getMessage(), null));
        }
    }

    // Tìm kiếm người dùng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/search")
    public ResponseEntity<ResponseObject> searchUsers(@RequestParam String q) {
        try {
            List<User> users = userService.searchUsers(q);
            return ResponseEntity.ok(new ResponseObject("200", "Users search completed successfully!", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error searching users: " + e.getMessage(), null));
        }
    }

    // ========== AUTHENTICATION ENDPOINTS ==========

    // Quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseObject> forgotPassword(@RequestBody Map<String, String> emailDto) {
        try {
            userService.forgotPassword(emailDto.get("email"));
            return ResponseEntity.ok(new ResponseObject("200", "Password reset email sent successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error sending password reset email: " + e.getMessage(), null));
        }
    }

    // Reset mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<ResponseObject> resetPassword(@RequestBody Map<String, String> resetDto) {
        try {
            userService.resetPassword(resetDto.get("token"), resetDto.get("newPassword"));
            return ResponseEntity.ok(new ResponseObject("200", "Password reset successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error resetting password: " + e.getMessage(), null));
        }
    }

    // Xác thực email
    @PostMapping("/verify-email")
    public ResponseEntity<ResponseObject> verifyEmail(@RequestBody Map<String, String> tokenDto) {
        try {
            userService.verifyEmail(tokenDto.get("token"));
            return ResponseEntity.ok(new ResponseObject("200", "Email verified successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error verifying email: " + e.getMessage(), null));
        }
    }

    // Gửi lại email xác thực
    @PostMapping("/resend-verification")
    public ResponseEntity<ResponseObject> resendVerificationEmail(@RequestBody Map<String, String> emailDto) {
        try {
            userService.resendVerificationEmail(emailDto.get("email"));
            return ResponseEntity.ok(new ResponseObject("200", "Verification email sent successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error sending verification email: " + e.getMessage(), null));
        }
    }
} 