package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.*;
import com.project.cinema.movie.Exception.ResourceNotFoundException;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ShowtimeRepository showtimeRepository;
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private ShowtimeSeatBookingRepository showtimeSeatBookingRepository;
    
    @Autowired
    private QRCodeService qrCodeService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private CouponService couponService;
    
    @Autowired
    private EventService eventService;
    
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithDetails();
    }
    
    public List<BookingDetailsResponse> getAllBookingsWithDetails() {
        try {
            List<Booking> bookings = bookingRepository.findAllWithDetails();
            return bookings.stream()
                    .filter(booking -> isValidBooking(booking))
                    .map(this::buildBookingDetailsResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching bookings with details, trying fallback method", e);
            // Fallback: lấy bookings cơ bản và xử lý từng cái
            return getAllBookingsWithDetailsFallback();
        }
    }
    
    private List<BookingDetailsResponse> getAllBookingsWithDetailsFallback() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .filter(booking -> isValidBooking(booking))
                .map(booking -> {
                    try {
                        return buildBookingDetailsResponse(booking);
                    } catch (Exception e) {
                        logger.warn("Error building details for booking ID: " + booking.getId(), e);
                        return buildBasicBookingDetailsResponse(booking);
                    }
                })
                .collect(Collectors.toList());
    }
    
    private boolean isValidBooking(Booking booking) {
        try {
            if (booking == null) {
                return false;
            }
            
            // Chỉ kiểm tra null, không trigger lazy loading
            if (booking.getShowtime() == null) {
                logger.warn("Booking {} has null showtime", booking.getId());
                return false;
            }
            
            // Không kiểm tra nested entities ở đây để tránh lazy loading
            // Sẽ xử lý lỗi trong buildBookingDetailsResponse
            return true;
        } catch (Exception e) {
            logger.warn("Invalid booking detected: " + booking.getId(), e);
            return false;
        }
    }
    
    private BookingDetailsResponse buildBasicBookingDetailsResponse(Booking booking) {
        BookingDetailsResponse response = new BookingDetailsResponse();
        response.setId(booking.getId());
        response.setTotalPrice(booking.getTotalPrice());
        response.setPaymentStatus(booking.getStatus() != null ? booking.getStatus().name() : "UNKNOWN");
        response.setCreatedAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : "");
        response.setCustomerName(booking.getCustomerName());
        response.setCustomerEmail(booking.getCustomerEmail());
        response.setCustomerPhone(booking.getCustomerPhone());
        response.setCustomerAddress(booking.getCustomerAddress());
        
        // Tạo movie DTO cơ bản nếu có lỗi
        MovieDTO movieDTO = new MovieDTO();
        movieDTO.setTitle("Movie not found");
        movieDTO.setDescription("Movie information unavailable");
        response.setMovie(movieDTO);
        
        // Tạo showtime DTO cơ bản
        ShowtimeDTO showtimeDTO = new ShowtimeDTO();
        try {
            if (booking.getShowtime() != null) {
                showtimeDTO.setStartTime(booking.getShowtime().getStartTime());
                showtimeDTO.setEndTime(booking.getShowtime().getEndTime());
            } else {
                showtimeDTO.setStartTime(null);
                showtimeDTO.setEndTime(null);
            }
        } catch (Exception e) {
            logger.warn("Error accessing showtime for booking {}: {}", booking.getId(), e.getMessage());
            showtimeDTO.setStartTime(null);
            showtimeDTO.setEndTime(null);
        }
        response.setShowtime(showtimeDTO);
        
        return response;
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public Booking createBooking(BookingDTO bookingDTO) {
        User user = userRepository.findById(bookingDTO.getUserId()).orElseThrow(() -> new RuntimeException("User id not found"));
        Showtime showtime = showtimeRepository.findById(bookingDTO.getShowtimeId()).orElseThrow(() -> new RuntimeException("Showtime id not found"));
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShowtime(showtime);
        booking.setTotalPrice(bookingDTO.getTotalPrice());
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking bookingDetails) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setTotalPrice(bookingDetails.getTotalPrice());
            return bookingRepository.save(booking);
        }).orElseThrow(() -> new ResourceNotFoundException("Cinema cannot be found with id :" + id));
    }

    public Booking save(Booking booking){
        return bookingRepository.save(booking);
    }
    
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    @Transactional
    public void assignSeatsToBooking(Booking booking, List<Long> seatIds) {
        logger.info("[BookingService] Assigning seats to booking ID: " + booking.getId());
        logger.info("[BookingService] Seat IDs to assign: " + seatIds);
        
        if (seatIds == null || seatIds.isEmpty()) {
            logger.info("[BookingService] No seat IDs provided for booking ID: " + booking.getId());
            return;
        }
        
        for (Long seatId : seatIds) {
            try {
                Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + seatId));
                
                logger.info("[BookingService] Found seat: " + seat.getSeatNumber());
                
                // Check if seat is already booked for this showtime
                ShowtimeSeatBooking existingBooking = showtimeSeatBookingRepository
                    .findByShowtimeIdAndSeatId(booking.getShowtime().getId(), seatId);
                
                if (existingBooking != null && existingBooking.getStatus() == SeatStatus.BOOKED) {
                    throw new IllegalStateException("Seat " + seat.getSeatNumber() + " is already booked for this showtime.");
                }
                
                // Create or update showtime seat booking record
                ShowtimeSeatBooking showtimeSeatBooking;
                if (existingBooking != null) {
                    showtimeSeatBooking = existingBooking;
                } else {
                    showtimeSeatBooking = new ShowtimeSeatBooking();
                    showtimeSeatBooking.setShowtime(booking.getShowtime());
                    showtimeSeatBooking.setSeat(seat);
                }
                
                showtimeSeatBooking.setBooking(booking);
                showtimeSeatBooking.setStatus(SeatStatus.BOOKED);
                
                showtimeSeatBookingRepository.save(showtimeSeatBooking);
                
                logger.info("[BookingService] Seat " + seat.getSeatNumber() + " assigned to booking ID: " + booking.getId());
            } catch (Exception e) {
                logger.info("[BookingService] Error assigning seat ID " + seatId + ": " + e.getMessage());
                throw e;
            }
        }
    }

    public List<Booking> getBookingsByShowtimeId(Long showtimeId) {
        return bookingRepository.findByShowtimeId(showtimeId);
    }

    // ========== ENHANCED BOOKING METHODS ==========

    // Lấy ghế có sẵn cho suất chiếu
    public List<String> getAvailableSeats(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        // Lấy tất cả ghế trong phòng
        List<Seat> allSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        
        // Kiểm tra nếu suất chiếu đã kết thúc
        Date now = new Date();
        if (showtime.getEndTime().before(now)) {
            logger.info("[BookingService] Showtime {} has ended, returning all seats as available", showtimeId);
            // Nếu suất chiếu đã kết thúc, trả về tất cả ghế là available
            List<String> allAvailableSeats = new ArrayList<>();
            for (Seat seat : allSeats) {
                allAvailableSeats.add(seat.getSeatNumber());
            }
            return allAvailableSeats;
        }
        
        // Lấy ghế đã đặt và đang giữ chỗ cho suất chiếu này
        List<ShowtimeSeatBooking> bookedSeats = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
        Set<Long> bookedSeatIds = new HashSet<>();
        for (ShowtimeSeatBooking booking : bookedSeats) {
            if (booking.getStatus() == SeatStatus.BOOKED || booking.getStatus() == SeatStatus.RESERVED) {
                bookedSeatIds.add(booking.getSeat().getId());
            }
        }
        
        // Lọc ghế có sẵn (tất cả ghế không bị booked cho showtime này)
        List<String> availableSeats = new ArrayList<>();
        for (Seat seat : allSeats) {
            if (!bookedSeatIds.contains(seat.getId())) {
                availableSeats.add(seat.getSeatNumber());
            }
        }
        
        return availableSeats;
    }

    // Lấy ghế đã đặt cho suất chiếu
    public List<String> getBookedSeats(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        // Kiểm tra nếu suất chiếu đã kết thúc
        Date now = new Date();
        if (showtime.getEndTime().before(now)) {
            logger.info("[BookingService] Showtime {} has ended, returning empty booked seats list", showtimeId);
            // Nếu suất chiếu đã kết thúc, trả về empty list (không có ghế nào được coi là booked)
            return new ArrayList<>();
        }
        
        List<ShowtimeSeatBooking> bookedSeats = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
        List<String> bookedSeatNumbers = new ArrayList<>();
        
        for (ShowtimeSeatBooking booking : bookedSeats) {
            if (booking.getStatus() == SeatStatus.BOOKED || booking.getStatus() == SeatStatus.RESERVED) {
                bookedSeatNumbers.add(booking.getSeat().getSeatNumber());
            }
        }
        
        return bookedSeatNumbers;
    }

    // Kiểm tra trạng thái ghế khi chọn (real-time check)
    public Map<String, Object> checkSeatStatus(Long showtimeId, String seatNumber) {
        logger.info("[BookingService] Checking seat status for showtime: {} seat: {}", showtimeId, seatNumber);
        
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        Date now = new Date();
        boolean isExpired = showtime.getEndTime().before(now);
        
        Map<String, Object> seatInfo = new HashMap<>();
        seatInfo.put("showtimeId", showtimeId);
        seatInfo.put("seatNumber", seatNumber);
        seatInfo.put("movieTitle", showtime.getMovie().getTitle());
        seatInfo.put("startTime", showtime.getStartTime());
        seatInfo.put("endTime", showtime.getEndTime());
        seatInfo.put("isExpired", isExpired);
        seatInfo.put("currentTime", now);
        
        if (isExpired) {
            // Nếu showtime đã kết thúc, ghế luôn available
            seatInfo.put("status", "AVAILABLE");
            seatInfo.put("message", "Showtime has ended, seat is available");
            logger.info("[BookingService] Showtime {} expired, seat {} is available", showtimeId, seatNumber);
        } else {
            // Kiểm tra trạng thái ghế thực tế
            List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
            boolean isBooked = false;
            
            for (ShowtimeSeatBooking booking : seatBookings) {
                if (booking.getSeat().getSeatNumber().equals(seatNumber)) {
                    if (booking.getStatus() == SeatStatus.BOOKED || booking.getStatus() == SeatStatus.RESERVED) {
                        isBooked = true;
                        seatInfo.put("status", "BOOKED");
                        seatInfo.put("message", "Seat is already booked");
                        logger.info("[BookingService] Seat {} is booked for showtime {}", seatNumber, showtimeId);
                        break;
                    }
                }
            }
            
            if (!isBooked) {
                seatInfo.put("status", "AVAILABLE");
                seatInfo.put("message", "Seat is available for booking");
                logger.info("[BookingService] Seat {} is available for showtime {}", seatNumber, showtimeId);
            }
        }
        
        return seatInfo;
    }

    // ========== ADMIN MANAGEMENT METHODS ==========

    public Page<Booking> getAllBookingsWithFilters(int page, int size, String status, String movieTitle, String username) {
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findAllWithFilters(pageable, status, movieTitle, username);
    }

    public Map<String, Object> getBookingDetails(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Map<String, Object> details = new HashMap<>();
        details.put("id", booking.getId());
        details.put("user", booking.getUser());
        details.put("showtime", booking.getShowtime());
        details.put("totalPrice", booking.getTotalPrice());
        details.put("status", booking.getStatus());
        details.put("createdAt", booking.getCreatedAt());
        
        // Lấy thông tin ghế từ showtime seat bookings
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        List<String> seatNumbers = new ArrayList<>();
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            seatNumbers.add(seatBooking.getSeat().getSeatNumber());
        }
        details.put("seatNumbers", seatNumbers);
        
        return details;
    }

    public Booking updateBookingStatus(Long bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(BookingStatus.valueOf(newStatus));
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Giải phóng ghế từ showtime seat bookings
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            showtimeSeatBookingRepository.delete(seatBooking);
        }
        
        // Cập nhật trạng thái booking
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public Map<String, Object> getBookingStats(String period) {
        Map<String, Object> stats = new HashMap<>();
        
        // Thống kê theo thời gian
        if ("today".equals(period)) {
            Date today = java.sql.Date.valueOf(LocalDate.now());
            Long todayBookings = bookingRepository.countByCreatedDateBetween(today, today);
            Double todayRevenue = bookingRepository.calculateRevenueBetweenDates(today, today);
            stats.put("bookings", todayBookings != null ? todayBookings : 0L);
            stats.put("revenue", todayRevenue != null ? todayRevenue : 0.0);
        } else if ("week".equals(period)) {
            Date weekStart = java.sql.Date.valueOf(LocalDate.now().minusDays(7));
            Date today = java.sql.Date.valueOf(LocalDate.now());
            Long weekBookings = bookingRepository.countByCreatedDateBetween(weekStart, today);
            Double weekRevenue = bookingRepository.calculateRevenueBetweenDates(weekStart, today);
            stats.put("bookings", weekBookings != null ? weekBookings : 0L);
            stats.put("revenue", weekRevenue != null ? weekRevenue : 0.0);
        } else {
            // Thống kê tổng
            Long totalBookings = bookingRepository.count();
            Double totalRevenue = bookingRepository.calculateTotalRevenue();
            stats.put("totalBookings", totalBookings);
            stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        }
        
        return stats;
    }

    public Map<String, Object> getShowtimeSeatInfo(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        Map<String, Object> seatInfo = new HashMap<>();
        seatInfo.put("showtime", showtime);
        seatInfo.put("availableSeats", getAvailableSeats(showtimeId));
        seatInfo.put("bookedSeats", getBookedSeats(showtimeId));
        
        return seatInfo;
    }

    public Page<Booking> searchBookings(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.searchBookings(query, pageable);
    }

    public Map<String, Object> exportBookings(String startDate, String endDate, String format) {
        Map<String, Object> exportData = new HashMap<>();
        
        // Logic xuất báo cáo (có thể implement sau)
        exportData.put("message", "Export functionality will be implemented");
        exportData.put("startDate", startDate);
        exportData.put("endDate", endDate);
        exportData.put("format", format);
        
        return exportData;
    }

    // Lấy lịch sử đặt vé của người dùng
    public List<BookingDetailsResponse> getUserBookingHistory(String userId) {
        try {
            List<Booking> bookings = bookingRepository.findByUserId(userId);
            return bookings.stream()
                    .filter(booking -> isValidBooking(booking))
                    .map(booking -> {
                        try {
                            return buildBookingDetailsResponse(booking);
                        } catch (Exception e) {
                            logger.warn("Error building details for user booking ID: " + booking.getId(), e);
                            return buildBasicBookingDetailsResponse(booking);
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching user booking history for user: " + userId, e);
            return new ArrayList<>();
        }
    }

    // Thống kê đặt vé (method cũ)
    public Map<String, Object> getBookingStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalBookings = bookingRepository.count();
        Double totalRevenue = bookingRepository.calculateTotalRevenue();
        Long todayBookings = bookingRepository.countByCreatedDateAfter(new Date());
        
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        stats.put("todayBookings", todayBookings);
        
        return stats;
    }

    // Xác nhận đặt vé
    public Booking confirmBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        // Cập nhật trạng thái đặt vé
        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    // Validate đặt vé
    public Map<String, Object> validateBooking(BookingDTO bookingDTO) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        
        // Kiểm tra user tồn tại
        User user = userRepository.findById(bookingDTO.getUserId()).orElse(null);
        if (user == null) {
            errors.add("User not found");
        }
        
        // Kiểm tra showtime tồn tại
        Showtime showtime = showtimeRepository.findById(bookingDTO.getShowtimeId()).orElse(null);
        if (showtime == null) {
            errors.add("Showtime not found");
        }
        
        // Kiểm tra giá vé
        if (bookingDTO.getTotalPrice() <= 0) {
            errors.add("Invalid price");
        }
        
        // Kiểm tra ghế có sẵn (nếu có thông tin ghế)
        if (bookingDTO.getSeatIds() != null && !bookingDTO.getSeatIds().isEmpty()) {
            for (Long seatId : bookingDTO.getSeatIds()) {
                Optional<Seat> seatOpt = seatRepository.findById(seatId);
                if (!seatOpt.isPresent()) {
                    errors.add("Seat with ID " + seatId + " not found");
                }
                // Kiểm tra thêm xem ghế có sẵn cho showtime này không
                else if (showtimeSeatBookingRepository.isSeatBookedForShowtime(bookingDTO.getShowtimeId(), seatId)) {
                    errors.add("Seat " + seatOpt.get().getSeatNumber() + " is not available for this showtime");
                }
            }
        }
        
        result.put("valid", errors.isEmpty());
        result.put("errors", errors);
        
        return result;
    }

    // Check seat availability for showtime
    public boolean checkSeatAvailability(Long showtimeId, List<Long> seatIds) {
        for (Long seatId : seatIds) {
            ShowtimeSeatBooking existingBooking = showtimeSeatBookingRepository
                .findByShowtimeIdAndSeatId(showtimeId, seatId);
            if (existingBooking != null && (existingBooking.getStatus() == SeatStatus.BOOKED || existingBooking.getStatus() == SeatStatus.RESERVED)) {
                return false; // Seat is already booked or reserved
            }
        }
        return true; // All seats are available
    }

    // Get booking by transaction reference
    public Booking getBookingByTxnRef(String txnRef) {
        // Find order by txnRef first
        Optional<Order> order = orderRepository.findByTxnRef(txnRef);
        if (order == null) {
            throw new RuntimeException("Order not found with txnRef: " + txnRef);
        }
        
        // Find booking by orderId
        Booking booking = bookingRepository.findByOrderId(order.get().getId());
        if (booking == null) {
            throw new RuntimeException("Booking not found for order: " + order.get().getId());
        }
        
        return booking;
    }

    // Reserve seats for a booking and showtime
    @Transactional
    public void reserveSeats(Long bookingId, Long showtimeId, List<Long> seatIds) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new RuntimeException("Showtime not found"));

        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

            // Check if seat is already booked for this showtime
            ShowtimeSeatBooking existingBooking = showtimeSeatBookingRepository
                .findByShowtimeIdAndSeatId(showtimeId, seatId);
            
            if (existingBooking != null && existingBooking.getStatus() == SeatStatus.BOOKED) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is already booked for this showtime");
            }

            // Create new seat reservation
            ShowtimeSeatBooking seatBooking = new ShowtimeSeatBooking();
            seatBooking.setShowtime(showtime);
            seatBooking.setSeat(seat);
            seatBooking.setBooking(booking);
            seatBooking.setStatus(SeatStatus.RESERVED); // Ghế đang chờ thanh toán
            
            showtimeSeatBookingRepository.save(seatBooking);
        }
    }

    // Find booking by booking ID
    public List<ShowtimeSeatBooking> findByBookingId(Long bookingId) {
        return showtimeSeatBookingRepository.findByBookingId(bookingId);
    }

    // Confirm payment and update seat status to BOOKED
    @Transactional
    public void confirmPayment(Long bookingId) {
        logger.info("[BookingService] Confirming payment for booking ID: " + bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Update booking status to CONFIRMED
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
        
        // Update all seats from RESERVED to BOOKED
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            if (seatBooking.getStatus() == SeatStatus.RESERVED) {
                seatBooking.setStatus(SeatStatus.BOOKED);
                showtimeSeatBookingRepository.save(seatBooking);
                logger.info("[BookingService] Seat " + seatBooking.getSeat().getSeatNumber() + " confirmed as BOOKED");
            }
        }
        
        // Apply automatic event discount if available
        try {
            logger.info("[BookingService] Checking for automatic event discounts for booking ID: {}", bookingId);
            applyAutomaticEventDiscount(bookingId);
        } catch (Exception e) {
            logger.warn("[BookingService] Error applying automatic event discount for booking ID: {} - Error: {}", 
                bookingId, e.getMessage());
            // Don't fail payment if event discount fails
        }
        
        // Apply coupon discount if coupon code is provided
        if (booking.getCouponCode() != null && !booking.getCouponCode().isEmpty()) {
            try {
                logger.info("[BookingService] Applying coupon discount for booking ID: {} with coupon: {}", 
                    bookingId, booking.getCouponCode());
                applyCouponDiscount(bookingId, booking.getCouponCode());
                logger.info("[BookingService] Successfully applied coupon discount for booking ID: {} with coupon: {}", 
                    bookingId, booking.getCouponCode());
            } catch (Exception e) {
                logger.error("[BookingService] Error applying coupon discount for booking ID: {} with coupon: {} - Error: {}", 
                    bookingId, booking.getCouponCode(), e.getMessage(), e);
                // Re-throw exception to ensure coupon processing is not silently ignored
                throw new RuntimeException("Failed to apply coupon discount: " + e.getMessage(), e);
            }
        } else {
            logger.info("[BookingService] No coupon code provided for booking ID: {}", bookingId);
        }
        
        logger.info("[BookingService] Payment confirmed successfully for booking ID: " + bookingId);
    }

    // Cancel payment and release reserved seats
    @Transactional
    public void cancelPayment(Long bookingId) {
        logger.info("[BookingService] Cancelling payment for booking ID: " + bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Update booking status to CANCELLED
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        
        // Release all reserved seats back to AVAILABLE
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            if (seatBooking.getStatus() == SeatStatus.RESERVED) {
                seatBooking.setStatus(SeatStatus.AVAILABLE);
                showtimeSeatBookingRepository.save(seatBooking);
                logger.info("[BookingService] Seat " + seatBooking.getSeat().getSeatNumber() + " released back to AVAILABLE");
            }
        }
        
        logger.info("[BookingService] Payment cancelled successfully for booking ID: " + bookingId);
    }

    // Timeout payment after 15 minutes
    @Transactional
    public void timeoutPayment(Long bookingId) {
        logger.info("[BookingService] Timing out payment for booking ID: " + bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Update booking status to PAYMENT_FAILED
        booking.setStatus(BookingStatus.PAYMENT_FAILED);
        bookingRepository.save(booking);
        
        // Release all reserved seats back to AVAILABLE
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            if (seatBooking.getStatus() == SeatStatus.RESERVED) {
                seatBooking.setStatus(SeatStatus.AVAILABLE);
                showtimeSeatBookingRepository.save(seatBooking);
                logger.info("[BookingService] Seat " + seatBooking.getSeat().getSeatNumber() + " released due to payment timeout");
            }
        }
        
        logger.info("[BookingService] Payment timed out successfully for booking ID: " + bookingId);
    }

    // Auto timeout payments after 15 minutes
    @Transactional
    public void autoTimeoutPayments() {
        logger.info("[BookingService] Starting auto timeout for pending payments");
        
        // Find all bookings with PENDING status older than 15 minutes
        List<Booking> pendingBookings = bookingRepository.findByStatusAndCreatedAtBefore(
            BookingStatus.PENDING, 
            new Date(System.currentTimeMillis() - 15 * 60 * 1000) // 15 minutes ago
        );
        
        for (Booking booking : pendingBookings) {
            try {
                timeoutPayment(booking.getId());
                logger.info("[BookingService] Auto timed out booking ID: " + booking.getId());
            } catch (Exception e) {
                logger.error("[BookingService] Error auto timing out booking ID " + booking.getId() + ": " + e.getMessage());
            }
        }
        
        logger.info("[BookingService] Auto timeout completed. Processed " + pendingBookings.size() + " bookings");
    }

    // Release seats for expired showtimes
    @Transactional
    public void releaseSeatsForExpiredShowtimes() {
        logger.info("[BookingService] Starting release seats for expired showtimes");
        
        // Find all showtimes that have ended
        List<Showtime> expiredShowtimes = showtimeRepository.findByEndTimeBefore(new Date());
        
        for (Showtime showtime : expiredShowtimes) {
            try {
                // Find all seat bookings for this showtime
                List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByShowtimeId(showtime.getId());
                
                int releasedCount = 0;
                for (ShowtimeSeatBooking seatBooking : seatBookings) {
                    if (seatBooking.getStatus() == SeatStatus.BOOKED || seatBooking.getStatus() == SeatStatus.RESERVED) {
                        seatBooking.setStatus(SeatStatus.AVAILABLE);
                        showtimeSeatBookingRepository.save(seatBooking);
                        releasedCount++;
                        
                        logger.info("[BookingService] Released seat {} for expired showtime {}", 
                            seatBooking.getSeat().getSeatNumber(), showtime.getId());
                    }
                }
                
                logger.info("[BookingService] Released {} seats for expired showtime ID: {}", 
                    releasedCount, showtime.getId());
                    
            } catch (Exception e) {
                logger.error("[BookingService] Error releasing seats for showtime ID " + showtime.getId() + ": " + e.getMessage());
            }
        }
        
        logger.info("[BookingService] Seat release completed. Processed " + expiredShowtimes.size() + " expired showtimes");
    }

    // Generate tickets for booking
    @Transactional
    public void generateTicketsForBooking(Booking booking, List<Long> seatIds) {
        Order order = booking.getOrder();
        
        // Get movie price from booking's showtime
        double moviePrice = booking.getShowtime().getMovie().getPrice();

        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

            Ticket ticket = new Ticket();
            ticket.setOrder(order);
            ticket.setSeat(seat);
            ticket.setPrice(calculateSeatPrice(seat, moviePrice));
            ticket.setStatus(TicketStatus.PENDING);
            // Token will be auto-generated by @PrePersist in Ticket entity

            ticketRepository.save(ticket);
            
            // Generate QR code for ticket after saving (so we have the token)
            try {
                String qrCodeUrl = qrCodeService.generateTicketQRCode(ticket.getId(), ticket.getToken());
                ticket.setQrCodeUrl(qrCodeUrl);
                ticketRepository.save(ticket); // Save QR code URL
            } catch (Exception e) {
                System.err.println("[BookingService] Error generating QR code for ticket " + ticket.getId() + ": " + e.getMessage());
                // Don't fail the entire process if QR code generation fails
            }
        }
    }

    // Calculate seat price based on seat type and movie price
    private double calculateSeatPrice(Seat seat, double moviePrice) {
        switch (seat.getSeatType()) {
            case VIP:
                return moviePrice + 40000.0; // Movie price + 40,000 VND
            case COUPLE:
                return moviePrice * 2.0; // Movie price * 2
            case REGULAR:
            default:
                return moviePrice; // Movie price for regular seats
        }
    }

    // Update booking status and generate tickets after payment
    @Transactional
    public Booking confirmPaymentAndGenerateTickets(String txnRef) {
        logger.info("[BookingService] confirmPaymentAndGenerateTickets called with txnRef: {}", txnRef);
        
        Booking booking = getBookingByTxnRef(txnRef);
        logger.info("[BookingService] Found booking ID: {} with coupon code: {}", 
            booking.getId(), booking.getCouponCode());
        
        // Confirm payment first (this will apply coupon discount and update seat status)
        confirmPayment(booking.getId());
        
        // Get seat IDs from ShowtimeSeatBooking
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository
            .findByBookingId(booking.getId());
        
        List<Long> seatIds = seatBookings.stream()
            .map(sb -> sb.getSeat().getId())
            .toList();
        
        // Generate tickets
        generateTicketsForBooking(booking, seatIds);
        
        // Update ticket status to PAID
        List<Ticket> tickets = ticketRepository.findByOrderId(booking.getOrder().getId());
        for (Ticket ticket : tickets) {
            ticket.setStatus(TicketStatus.PAID);
            ticketRepository.save(ticket);
        }
        
        // Update booking status to PAID using short value for database
        booking.setStatus(BookingStatus.PAID);
        bookingRepository.save(booking);
        
        // Email will be sent from frontend after QR code generation
        logger.info("🎯 [BOOKING] Email will be handled by frontend with QR code");
        
        return booking;
    }

    // Get booking with full details including tickets by booking ID
    public BookingDetailsResponse getBookingDetailsById(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found with id: " + bookingId);
        }
        return buildBookingDetailsResponse(booking);
    }

    // Get booking with full details including tickets
    public BookingDetailsResponse getBookingWithDetails(String txnRef) {
        Booking booking = getBookingByTxnRef(txnRef);
        return buildBookingDetailsResponse(booking);
    }

    // Helper method to build BookingDetailsResponse from Booking
    private BookingDetailsResponse buildBookingDetailsResponse(Booking booking) {
        try {
            BookingDetailsResponse response = new BookingDetailsResponse();
            response.setId(booking.getId());

            // Map MovieDTO với error handling
            MovieDTO movieDTO = new MovieDTO();
            try {
                if (booking.getShowtime() != null && booking.getShowtime().getMovie() != null) {
                    Movie movie = booking.getShowtime().getMovie();
                    movieDTO.setTitle(movie.getTitle());
                    movieDTO.setDescription(movie.getDescription());
                    movieDTO.setDuration(movie.getDuration());
                    movieDTO.setReleaseDate(movie.getReleaseDate());
                    movieDTO.setGenre(movie.getGenre());
                    movieDTO.setDirector(movie.getDirector());
                    movieDTO.setTrailerUrl(movie.getTrailerUrl());
                    movieDTO.setLanguage(movie.getLanguage());
                    movieDTO.setCast(movie.getCast());
                    movieDTO.setRating(movie.getRating());
                    movieDTO.setStatus(movie.getStatus());
                    movieDTO.setPrice(movie.getPrice());
                    movieDTO.setFilmRating(movie.getFilmRating());
                } else {
                    logger.warn("Showtime or Movie is null for booking {}: showtime={}, movie={}", 
                        booking.getId(), 
                        booking.getShowtime() != null ? "exists" : "null",
                        booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? "exists" : "null");
                    movieDTO.setTitle("Movie not found");
                    movieDTO.setDescription("Movie information unavailable");
                }
            } catch (Exception e) {
                logger.warn("Error mapping movie for booking {}: {}", booking.getId(), e.getMessage());
                movieDTO.setTitle("Movie not found");
                movieDTO.setDescription("Movie information unavailable");
            }
            response.setMovie(movieDTO);

            // Map ShowtimeDTO với error handling
            ShowtimeDTO showtimeDTO = new ShowtimeDTO();
            try {
                if (booking.getShowtime() != null) {
                    Showtime showtime = booking.getShowtime();
                    showtimeDTO.setStartTime(showtime.getStartTime());
                    showtimeDTO.setEndTime(showtime.getEndTime());
                    
                    if (showtime.getRoom() != null) {
                        showtimeDTO.setRoomId(showtime.getRoom().getId());
                        
                        // Map RoomDTO with Cinema info
                        Room room = showtime.getRoom();
                        RoomDTO roomDTO = new RoomDTO();
                        roomDTO.setName(room.getName());
                        roomDTO.setCapacity(room.getCapacity());
                        
                        if (room.getCinema() != null) {
                            roomDTO.setCinemaId(room.getCinema().getId());
                            
                            // Map CinemaDTO
                            Cinema cinema = room.getCinema();
                            CinemaDTO cinemaDTO = new CinemaDTO();
                                        cinemaDTO.setId(cinema.getId());
                            cinemaDTO.setName(cinema.getName());
                            cinemaDTO.setAddress(cinema.getAddress());
                            cinemaDTO.setPhone(cinema.getPhone());
                            cinemaDTO.setCinemaType(cinema.getCinemaType());
                            
                            roomDTO.setCinema(cinemaDTO);
                        } else {
                            // Room exists but cinema is null
                            CinemaDTO cinemaDTO = new CinemaDTO();
                            cinemaDTO.setId(0L);
                            cinemaDTO.setName("Cinema not found");
                            cinemaDTO.setAddress("Address not available");
                            cinemaDTO.setPhone("Phone not available");
                            cinemaDTO.setCinemaType(null);
                            roomDTO.setCinema(cinemaDTO);
                        }
                        showtimeDTO.setRoom(roomDTO);
                    } else {
                        // Showtime exists but room is null
                        RoomDTO roomDTO = new RoomDTO();
                        roomDTO.setName("Room not found");
                        roomDTO.setCapacity(0);
                        roomDTO.setCinemaId(0L);
                        
                        CinemaDTO cinemaDTO = new CinemaDTO();
                        cinemaDTO.setId(0L);
                        cinemaDTO.setName("Cinema not found");
                        cinemaDTO.setAddress("Address not available");
                        cinemaDTO.setPhone("Phone not available");
                        cinemaDTO.setCinemaType(null);
                        
                        roomDTO.setCinema(cinemaDTO);
                        showtimeDTO.setRoom(roomDTO);
                    }
                    
                    if (showtime.getMovie() != null) {
                        showtimeDTO.setMovieId(showtime.getMovie().getId());
                    } else {
                        showtimeDTO.setMovieId(0L);
                    }
                } else {
                    // Showtime is null
                    logger.warn("Showtime is null for booking {}", booking.getId());
                    RoomDTO roomDTO = new RoomDTO();
                    roomDTO.setName("Room not found");
                    roomDTO.setCapacity(0);
                    roomDTO.setCinemaId(0L);
                    
                    CinemaDTO cinemaDTO = new CinemaDTO();
                    cinemaDTO.setId(0L);
                    cinemaDTO.setName("Cinema not found");
                    cinemaDTO.setAddress("Address not available");
                    cinemaDTO.setPhone("Phone not available");
                    cinemaDTO.setCinemaType(null);
                    
                    roomDTO.setCinema(cinemaDTO);
                    showtimeDTO.setRoom(roomDTO);
                    showtimeDTO.setMovieId(0L);
                }
            } catch (Exception e) {
                logger.warn("Error mapping showtime/room/cinema for booking {}: {}", booking.getId(), e.getMessage());
                // Tạo room và cinema DTO cơ bản
                RoomDTO roomDTO = new RoomDTO();
                roomDTO.setName("Room not found");
                roomDTO.setCapacity(0);
                roomDTO.setCinemaId(0L);
                
                CinemaDTO cinemaDTO = new CinemaDTO();
                cinemaDTO.setId(0L);
                cinemaDTO.setName("Cinema not found");
                cinemaDTO.setAddress("Address not available");
                cinemaDTO.setPhone("Phone not available");
                cinemaDTO.setCinemaType(null);
                
                roomDTO.setCinema(cinemaDTO);
                showtimeDTO.setRoom(roomDTO);
                showtimeDTO.setMovieId(0L);
            }
            response.setShowtime(showtimeDTO);

            // Map OrderDTO với error handling
            Order order = booking.getOrder();
            if (order != null) {
                OrderDTO orderDTO = new OrderDTO();
                try {
                    orderDTO.setUserId(order.getUser() != null ? order.getUser().getId().toString() : null);
                    orderDTO.setShowtimeId(booking.getShowtime() != null ? booking.getShowtime().getId() : null);
                    // Use booking totalPrice instead of order totalPrice to fix price mismatch
                    orderDTO.setTotalPrice(booking.getTotalPrice());
                    orderDTO.setCustomerEmail(order.getCustomerEmail());
                    orderDTO.setCustomerName(booking.getCustomerName());
                    orderDTO.setCustomerPhone(booking.getCustomerPhone());
                    orderDTO.setCustomerAddress(booking.getCustomerAddress());
                } catch (Exception e) {
                    logger.warn("Error mapping order for booking {}: {}", booking.getId(), e.getMessage());
                    orderDTO.setUserId(null);
                    orderDTO.setShowtimeId(null);
                    orderDTO.setTotalPrice(booking.getTotalPrice());
                    orderDTO.setCustomerEmail(booking.getCustomerEmail());
                    orderDTO.setCustomerName(booking.getCustomerName());
                    orderDTO.setCustomerPhone(booking.getCustomerPhone());
                    orderDTO.setCustomerAddress(booking.getCustomerAddress());
                }

                // Map tickets với error handling
                try {
                    List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
                    // Use a set to avoid duplicate seats
                    Set<Long> seatIdsSet = new HashSet<>();
                    List<TicketDTO> ticketDTOs = new ArrayList<>();
                    for (Ticket ticket : tickets) {
                        try {
                            if (ticket.getSeat() != null && seatIdsSet.contains(ticket.getSeat().getId())) {
                                // Skip duplicate seat
                                continue;
                            }
                            if (ticket.getSeat() != null) {
                                seatIdsSet.add(ticket.getSeat().getId());
                            }
                            TicketDTO ticketDTO = new TicketDTO();
                            ticketDTO.setId(ticket.getId());
                            ticketDTO.setOrderId(ticket.getOrder().getId());
                            ticketDTO.setSeatId(ticket.getSeat() != null ? ticket.getSeat().getId() : null);
                            ticketDTO.setPrice(ticket.getPrice());
                            ticketDTO.setToken(ticket.getToken());
                            ticketDTO.setStatus(ticket.getStatus().toString());
                            ticketDTO.setQrCodeUrl(ticket.getQrCodeUrl());
                            // Map Seat to SeatDTO
                            if (ticket.getSeat() != null) {
                                Seat seat = ticket.getSeat();
                                SeatDTO seatDTO = new SeatDTO();
                                seatDTO.setSeatNumber(seat.getSeatNumber());
                                seatDTO.setRowNumber(seat.getRowNumber());
                                seatDTO.setColumnNumber(seat.getColumnNumber());
                                seatDTO.setRoomId(seat.getRoom() != null ? seat.getRoom().getId() : null);
                                seatDTO.setSeatType(seat.getSeatType());
                                seatDTO.setPrice(ticket.getPrice()); // Use ticket price
                                ticketDTO.setSeat(seatDTO);
                            }
                            ticketDTOs.add(ticketDTO);
                        } catch (Exception e) {
                            logger.warn("Error mapping ticket {} for booking {}: {}", ticket.getId(), booking.getId(), e.getMessage());
                            // Skip invalid ticket
                        }
                    }
                    orderDTO.setTickets(ticketDTOs);
                } catch (Exception e) {
                    logger.warn("Error mapping tickets for booking {}: {}", booking.getId(), e.getMessage());
                    orderDTO.setTickets(new ArrayList<>());
                }

                response.setOrder(orderDTO);
            }

            response.setCustomerName(booking.getCustomerName());
            response.setCustomerEmail(booking.getCustomerEmail());
            response.setCustomerPhone(booking.getCustomerPhone());
            response.setCustomerAddress(booking.getCustomerAddress());
            response.setTotalPrice(booking.getTotalPrice());
            
            // Set createdAt
            if (booking.getCreatedAt() != null) {
                response.setCreatedAt(booking.getCreatedAt().toString());
            }

            // Set payment status and method from order status if available
            if (order != null) {
                response.setPaymentStatus(order.getStatus());
                // Assuming payment method is stored somewhere, else set null or default
                response.setPaymentMethod("VNPay");
            } else {
                response.setPaymentStatus(booking.getStatus().toString());
                response.setPaymentMethod("VNPay");
            }

            return response;
        } catch (Exception e) {
            logger.error("Error building booking details response for booking {}: {}", booking.getId(), e.getMessage(), e);
            // Fallback to basic response
            return buildBasicBookingDetailsResponse(booking);
        }
    }

    /**
     * Get list of tickets for a given booking ID
     */
    public List<Ticket> getTicketsByBookingId(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking == null || booking.getOrder() == null) {
            throw new RuntimeException("Booking or order not found for id: " + bookingId);
        }
        Long orderId = booking.getOrder().getId();
        return ticketRepository.findByOrderId(orderId);
    }
    
    // =====================================================
    // COUPON AND EVENT DISCOUNT METHODS
    // =====================================================
    
    /**
     * Apply coupon discount to booking
     */
    @Transactional
    public Booking applyCouponDiscount(Long bookingId, String couponCode) {
        logger.info("[BookingService] Applying coupon discount: {} to booking: {}", couponCode, bookingId);
        
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        User user = booking.getUser();
        if (user == null) {
            throw new RuntimeException("User not found for booking");
        }
        
        // Get original amount before any discount (from seat bookings)
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(bookingId);
        Double originalAmount = 0.0;
        for (ShowtimeSeatBooking seatBooking : seatBookings) {
            Double moviePrice = seatBooking.getShowtime().getMovie().getPrice();
            originalAmount += calculateSeatPrice(seatBooking.getSeat(), moviePrice);
        }
        
        logger.info("[BookingService] Original amount calculated: {} for booking: {}", originalAmount, bookingId);
        
        // Validate coupon with original amount
        CouponValidationDTO validation = couponService.validateCoupon(couponCode, originalAmount, Long.parseLong(user.getId()));
        if (!validation.isValid()) {
            throw new RuntimeException(validation.getMessage());
        }
        
        // Apply coupon discount
        Double discountAmount = validation.getDiscountAmount();
        Double finalAmount = validation.getFinalAmount();
        
        // Update booking total price
        booking.setTotalPrice(finalAmount);
        
        // Use coupon
        logger.info("[BookingService] Calling couponService.useCoupon with: code={}, user={}, booking={}, originalAmount={}", 
            couponCode, user.getId(), booking.getId(), originalAmount);
        
        couponService.useCoupon(couponCode, user, booking, originalAmount);
        
        // Save booking
        Booking updatedBooking = bookingRepository.save(booking);
        
        logger.info("[BookingService] Coupon discount applied successfully: original={}, discount={}, final={}", 
            originalAmount, discountAmount, finalAmount);
        
        return updatedBooking;
    }
    
    /**
     * Apply automatic event discount to booking
     */
    @Transactional
    public void applyAutomaticEventDiscount(Long bookingId) {
        logger.info("[BookingService] Applying automatic event discount for booking ID: {}", bookingId);
        
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            logger.warn("[BookingService] Booking not found for ID: {}", bookingId);
            return;
        }
        
        User user = booking.getUser();
        if (user == null) {
            logger.warn("[BookingService] User not found for booking ID: {}", bookingId);
            return;
        }
        
        // Get current booking total price
        Double currentTotalPrice = booking.getTotalPrice();
        logger.info("[BookingService] Current booking total price: {} for booking ID: {}", currentTotalPrice, bookingId);
        
        // Get all active events that are currently running
        List<EventDTO> activeEvents = eventService.getCurrentEvents();
        logger.info("[BookingService] Found {} active events", activeEvents.size());
        
        if (activeEvents.isEmpty()) {
            logger.info("[BookingService] No active events found for booking ID: {}", bookingId);
            return;
        }
        
        // Find the best applicable event (highest discount)
        EventDTO bestEvent = null;
        Double bestDiscount = 0.0;
        
        for (EventDTO event : activeEvents) {
            try {
                EventValidationDTO validation = eventService.validateEvent(event.getId(), currentTotalPrice, Long.parseLong(user.getId()));
                if (validation.isValid() && validation.getDiscountAmount() > bestDiscount) {
                    bestEvent = event;
                    bestDiscount = validation.getDiscountAmount();
                    logger.info("[BookingService] Found applicable event: {} with discount: {}", event.getName(), validation.getDiscountAmount());
                }
            } catch (Exception e) {
                logger.warn("[BookingService] Error validating event {} for booking {}: {}", event.getId(), bookingId, e.getMessage());
            }
        }
        
        if (bestEvent != null) {
            try {
                logger.info("[BookingService] Applying best event discount: {} for booking ID: {}", bestEvent.getName(), bookingId);
                applyEventDiscount(bookingId, bestEvent.getId());
                logger.info("[BookingService] Successfully applied automatic event discount: {} for booking ID: {}", bestEvent.getName(), bookingId);
            } catch (Exception e) {
                logger.error("[BookingService] Error applying automatic event discount for booking ID: {} - Error: {}", bookingId, e.getMessage(), e);
            }
        } else {
            logger.info("[BookingService] No applicable events found for booking ID: {}", bookingId);
        }
    }
    
    /**
     * Apply event discount to booking
     */
    @Transactional
    public Booking applyEventDiscount(Long bookingId, Long eventId) {
        logger.info("[BookingService] Applying event discount: {} to booking: {}", eventId, bookingId);
        
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        User user = booking.getUser();
        if (user == null) {
            throw new RuntimeException("User not found for booking");
        }
        
        // Validate event
        EventValidationDTO validation = eventService.validateEvent(eventId, booking.getTotalPrice(), Long.parseLong(user.getId()));
        if (!validation.isValid()) {
            throw new RuntimeException(validation.getMessage());
        }
        
        // Apply event discount
        Double originalAmount = booking.getTotalPrice();
        Double discountAmount = validation.getDiscountAmount();
        Double finalAmount = validation.getFinalAmount();
        
        // Update booking total price
        booking.setTotalPrice(finalAmount);
        
        // Use event
        eventService.useEvent(eventId, user, booking, originalAmount);
        
        // Save booking
        Booking updatedBooking = bookingRepository.save(booking);
        
        logger.info("[BookingService] Event discount applied successfully: original={}, discount={}, final={}", 
            originalAmount, discountAmount, finalAmount);
        
        return updatedBooking;
    }
    
    /**
     * Get available coupons for booking
     */
    public List<CouponDTO> getAvailableCouponsForBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        return couponService.getApplicableCoupons(booking.getTotalPrice());
    }
    
    /**
     * Get available events for booking
     */
    public List<EventDTO> getAvailableEventsForBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        return eventService.getApplicableEvents(booking.getTotalPrice());
    }
    
    /**
     * Calculate total discount for booking with coupon and event
     */
    public DiscountCalculationDTO calculateTotalDiscount(Long bookingId, String couponCode, Long eventId) {
        logger.info("[BookingService] Calculating total discount for booking: {} with coupon: {} and event: {}", 
            bookingId, couponCode, eventId);
        
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        User user = booking.getUser();
        if (user == null) {
            throw new RuntimeException("User not found for booking");
        }
        
        Double originalAmount = booking.getTotalPrice();
        Double couponDiscount = 0.0;
        Double eventDiscount = 0.0;
        Double totalDiscount = 0.0;
        Double finalAmount = originalAmount;
        
        CouponDTO coupon = null;
        EventDTO event = null;
        
        // Calculate coupon discount
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            CouponValidationDTO couponValidation = couponService.validateCoupon(couponCode, originalAmount, Long.parseLong(user.getId()));
            if (couponValidation.isValid()) {
                couponDiscount = couponValidation.getDiscountAmount();
                coupon = couponValidation.getCoupon();
            }
        }
        
        // Calculate event discount
        if (eventId != null) {
            EventValidationDTO eventValidation = eventService.validateEvent(eventId, originalAmount, Long.parseLong(user.getId()));
            if (eventValidation.isValid()) {
                eventDiscount = eventValidation.getDiscountAmount();
                event = eventValidation.getEvent();
            }
        }
        
        // Calculate total discount (coupon + event)
        totalDiscount = couponDiscount + eventDiscount;
        finalAmount = originalAmount - totalDiscount;
        
        // Ensure final amount is not negative
        if (finalAmount < 0) {
            finalAmount = 0.0;
        }
        
        logger.info("[BookingService] Discount calculation completed: original={}, coupon={}, event={}, total={}, final={}", 
            originalAmount, couponDiscount, eventDiscount, totalDiscount, finalAmount);
        
        return new DiscountCalculationDTO(
            originalAmount,
            couponDiscount,
            eventDiscount,
            totalDiscount,
            finalAmount,
            coupon,
            event
        );
    }
    
    /**
     * Apply both coupon and event discount to booking
     */
    @Transactional
    public Booking applyBothDiscounts(Long bookingId, String couponCode, Long eventId) {
        logger.info("[BookingService] Applying both discounts to booking: {} with coupon: {} and event: {}", 
            bookingId, couponCode, eventId);
        
        Booking booking = getBookingById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }
        
        User user = booking.getUser();
        if (user == null) {
            throw new RuntimeException("User not found for booking");
        }
        
        // Calculate total discount
        DiscountCalculationDTO discountCalc = calculateTotalDiscount(bookingId, couponCode, eventId);
        
        // Update booking total price
        booking.setTotalPrice(discountCalc.getFinalAmount());
        
        // Apply coupon if valid
        if (couponCode != null && !couponCode.trim().isEmpty() && discountCalc.getCoupon() != null) {
            couponService.useCoupon(couponCode, user, booking, discountCalc.getOriginalAmount());
        }
        
        // Apply event if valid
        if (eventId != null && discountCalc.getEvent() != null) {
            eventService.useEvent(eventId, user, booking, discountCalc.getOriginalAmount());
        }
        
        // Save booking
        Booking updatedBooking = bookingRepository.save(booking);
        
        logger.info("[BookingService] Both discounts applied successfully: original={}, final={}", 
            discountCalc.getOriginalAmount(), discountCalc.getFinalAmount());
        
        return updatedBooking;
    }
    
    // Inner class cho discount calculation
    public static class DiscountCalculationDTO {
        private Double originalAmount;
        private Double couponDiscount;
        private Double eventDiscount;
        private Double totalDiscount;
        private Double finalAmount;
        private CouponDTO coupon;
        private EventDTO event;
        
        public DiscountCalculationDTO(Double originalAmount, Double couponDiscount, Double eventDiscount, 
                                    Double totalDiscount, Double finalAmount, CouponDTO coupon, EventDTO event) {
            this.originalAmount = originalAmount;
            this.couponDiscount = couponDiscount;
            this.eventDiscount = eventDiscount;
            this.totalDiscount = totalDiscount;
            this.finalAmount = finalAmount;
            this.coupon = coupon;
            this.event = event;
        }
        
        // Getters
        public Double getOriginalAmount() { return originalAmount; }
        public Double getCouponDiscount() { return couponDiscount; }
        public Double getEventDiscount() { return eventDiscount; }
        public Double getTotalDiscount() { return totalDiscount; }
        public Double getFinalAmount() { return finalAmount; }
        public CouponDTO getCoupon() { return coupon; }
        public EventDTO getEvent() { return event; }
    }

}
