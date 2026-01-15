package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.RegisterRequest;
import com.project.cinema.movie.Models.Order;
import com.project.cinema.movie.Models.Payment;
import com.project.cinema.movie.Models.Role;
import com.project.cinema.movie.Models.Seat;
import com.project.cinema.movie.Models.ShowtimeSeatBooking;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Repositories.OrderRepository;
import com.project.cinema.movie.Repositories.SeatRepository;
import com.project.cinema.movie.Repositories.ShowtimeSeatBookingRepository;
import com.project.cinema.movie.Repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserDetailsServiceImp userDetailsServiceImp;
    
    @Autowired
    private SeatRepository seatRepository;
    @Autowired
    private ShowtimeSeatBookingRepository showtimeSeatBookingRepository;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    @Transactional
    public User register(RegisterRequest newUser) {
        // 1. Mã hóa password trước khi lưu
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        // 2. Tạo User trước
        User user = new User(newUser.getUsername(), newUser.getPassword(), newUser.getEmail());
        user.setRole(Role.USER);
        user.setFullName(newUser.getFullName());
        user.setPhoneNumber(newUser.getPhone());
        
        // Set birthday if provided
        if (newUser.getBirthday() != null && !newUser.getBirthday().isEmpty()) {
            try {
                user.setBirthday(java.time.LocalDateTime.parse(newUser.getBirthday() + "T00:00:00"));
            } catch (Exception e) {
                // If parsing fails, birthday will remain null
                logger.warn("Failed to parse birthday: {}", newUser.getBirthday());
            }
        }
        
        user = userRepository.save(user); // Lưu User trước để có ID

        // 3. Tạo Order và gán User vào
        Order order = new Order();
        order.setUser(user);
        orderRepository.save(order); // Lưu Order sau khi có User

        // 4. Gán Order vào danh sách của User
        user.getOrders().add(order);

        return userRepository.save(user);
    }

    @Transactional
    public User registerAdmin(RegisterRequest newUser) {
        // 1. Mã hóa password trước khi lưu
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        // 2. Tạo User admin
        User user = new User(newUser.getUsername(), newUser.getPassword(), newUser.getEmail());
        user.setRole(Role.ADMIN);
        user.setFullName(newUser.getFullName() != null ? newUser.getFullName() : newUser.getUsername());
        user.setPhoneNumber(newUser.getPhone());
        
        // Set birthday if provided
        if (newUser.getBirthday() != null && !newUser.getBirthday().isEmpty()) {
            try {
                user.setBirthday(java.time.LocalDateTime.parse(newUser.getBirthday() + "T00:00:00"));
            } catch (Exception e) {
                // If parsing fails, birthday will remain null
                logger.warn("Failed to parse birthday: {}", newUser.getBirthday());
            }
        }
        
        return userRepository.save(user);
    }



    public User save(User user){
        return userRepository.save(user);
    }

    public Optional<User> findByUserId(String id){
        return userRepository.findById(id);
    }
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    public Optional<User> findByEmail(String email){return userRepository.findByEmail(email);}

    // ========== USER PROFILE METHODS ==========

    public User getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Map<String, Object> getUserProfile(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("fullName", user.getFullName());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("registrationDate", user.getRegistrationDate());
        profile.put("role", user.getRole().name());
        
        // Thống kê đặt vé
        Long totalBookings = userRepository.countUserBookings(userId);
        Double totalSpent = userRepository.calculateUserTotalSpent(userId);
        
        profile.put("totalBookings", totalBookings != null ? totalBookings : 0L);
        profile.put("totalSpent", totalSpent != null ? totalSpent : 0.0);
        
        return profile;
    }

    public User updateUserProfile(String userId, Map<String, Object> updateDto, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        
        // Chỉ cho phép cập nhật profile của chính mình hoặc admin
        if (!currentUser.getId().equals(userId) && currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Unauthorized to update this user profile");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updateDto.containsKey("fullName")) {
            user.setFullName((String) updateDto.get("fullName"));
        }
        if (updateDto.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) updateDto.get("phoneNumber"));
        }
        if (updateDto.containsKey("email")) {
            String newEmail = (String) updateDto.get("email");
            if (!newEmail.equals(user.getEmail())) {
                // Kiểm tra email đã tồn tại chưa
                if (userRepository.findByEmail(newEmail).isPresent()) {
                    throw new RuntimeException("Email already exists");
                }
                user.setEmail(newEmail);
            }
        }
        
        return userRepository.save(user);
    }

    public void changePassword(Map<String, String> passwordDto, Authentication authentication) {
        User user = getCurrentUser(authentication);
        
        String currentPassword = passwordDto.get("currentPassword");
        String newPassword = passwordDto.get("newPassword");
        String confirmPassword = passwordDto.get("confirmPassword");
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Kiểm tra mật khẩu mới
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("New passwords do not match");
        }
        
        // Cập nhật mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<Map<String, Object>> getUserBookingHistory(String userId) {
        List<Map<String, Object>> bookings = userRepository.findUserBookings(userId);
        
        // Thêm thông tin ghế cho mỗi booking
        for (Map<String, Object> booking : bookings) {
            Long bookingId = Long.valueOf(booking.get("id").toString());
            List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
            List<String> seatNumbers = seatBookings.stream()
                .map(seatBooking -> seatBooking.getSeat().getSeatNumber())
                .collect(java.util.stream.Collectors.toList());
            booking.put("seatNumbers", seatNumbers);
        }
        
        return bookings;
    }

    // Lấy lịch sử thanh toán của user
    public List<Map<String, Object>> getUserPaymentHistory(String userId) {
        List<Payment> payments = userRepository.findUserPayments(userId);
        List<Map<String, Object>> paymentHistory = new ArrayList<>();
        
        for (Payment payment : payments) {
            Map<String, Object> paymentInfo = new HashMap<>();
            paymentInfo.put("id", payment.getId());
            paymentInfo.put("amount", payment.getAmount());
            paymentInfo.put("paymentMethod", payment.getPaymentMethod());
            paymentInfo.put("status", payment.getStatus());
            paymentInfo.put("createdAt", payment.getCreatedAt());
            
            // Thêm thông tin booking nếu có
            if (payment.getBooking() != null) {
                paymentInfo.put("bookingId", payment.getBooking().getId());
                paymentInfo.put("bookingTotal", payment.getBooking().getTotalPrice());
            }
            
            paymentHistory.add(paymentInfo);
        }
        
        return paymentHistory;
    }

    public Map<String, Object> getUserStats(String userId) {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalBookings = userRepository.countUserBookings(userId);
        Double totalSpent = userRepository.calculateUserTotalSpent(userId);
        Date weekAgo = java.sql.Date.valueOf(LocalDate.now().minusDays(7));
        Long recentBookings = userRepository.countRecentUserBookings(userId, weekAgo);
        
        stats.put("totalBookings", totalBookings != null ? totalBookings : 0L);
        stats.put("totalSpent", totalSpent != null ? totalSpent : 0.0);
        stats.put("recentBookings", recentBookings != null ? recentBookings : 0L);
        
        return stats;
    }

    // ========== ADMIN METHODS ==========

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(Map<String, Object> userData) {
        // Tạo username từ email nếu không có username
        String username = (String) userData.get("username");
        if (username == null || username.trim().isEmpty()) {
            String email = (String) userData.get("email");
            username = email.split("@")[0];
        }

        // Tạo password mặc định nếu không có
        String password = (String) userData.get("password");
        if (password == null || password.trim().isEmpty()) {
            password = "123456"; // Password mặc định
        }

        // Kiểm tra username đã tồn tại chưa
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username đã tồn tại: " + username);
        }

        // Kiểm tra email đã tồn tại chưa
        String email = (String) userData.get("email");
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã tồn tại: " + email);
        }

        // Tạo User mới
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFullName((String) userData.get("fullName"));
        user.setPhoneNumber((String) userData.get("phone"));
        
        // Set role
        String role = (String) userData.get("role");
        if ("ADMIN".equals(role)) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }
        
        user.setActive(Boolean.TRUE);
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(String userId, Map<String, Object> userData) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Cập nhật thông tin
        if (userData.containsKey("fullName")) {
            user.setFullName((String) userData.get("fullName"));
        }
        if (userData.containsKey("email")) {
            String email = (String) userData.get("email");
            // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
            if (!email.equals(user.getEmail()) && userRepository.findByEmail(email).isPresent()) {
                throw new RuntimeException("Email đã tồn tại: " + email);
            }
            user.setEmail(email);
        }
        if (userData.containsKey("phone")) {
            user.setPhoneNumber((String) userData.get("phone"));
        }
        if (userData.containsKey("role")) {
            String role = (String) userData.get("role");
            if ("ADMIN".equals(role)) {
                user.setRole(Role.ADMIN);
            } else {
                user.setRole(Role.USER);
            }
        }
        if (userData.containsKey("isActive")) {
            user.setActive((Boolean) userData.get("isActive"));
        }

        return userRepository.save(user);
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserRole(String userId, String role) {
        User user = getUserById(userId);
        user.setRole(Role.valueOf(role.toUpperCase()));
        return userRepository.save(user);
    }

    public User toggleUserStatus(String userId, Boolean isActive) {
        User user = getUserById(userId);
        // Implement status toggle logic here
        return userRepository.save(user);
    }

    public void deleteUser(String userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }

    public Map<String, Object> getUsersStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countActiveUsers();
        Long newUsers = userRepository.countByRegistrationDateAfter(
            LocalDateTime.now().minusDays(7));
        
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("newUsers", newUsers);
        
        return stats;
    }

    public List<User> searchUsers(String query) {
        return userRepository.searchUsers(query);
    }

    // ========== AUTHENTICATION METHODS ==========

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Implement password reset logic here
        // Send email with reset token
    }

    public void resetPassword(String token, String newPassword) {
        // Implement password reset logic here
        // Validate token and update password
    }

    public void verifyEmail(String token) {
        // Implement email verification logic here
        // Validate token and mark email as verifiedx
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Implement resend verification email logic here
    }
}
