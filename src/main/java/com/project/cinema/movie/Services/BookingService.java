package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.*;
import com.project.cinema.movie.Exception.ResourceNotFoundException;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
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

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithDetails();
    }
    
    public List<BookingDetailsResponse> getAllBookingsWithDetails() {
        List<Booking> bookings = bookingRepository.findAllWithDetails();
        return bookings.stream()
                .map(this::buildBookingDetailsResponse)
                .collect(Collectors.toList());
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
        System.out.println("[BookingService] Assigning seats to booking ID: " + booking.getId());
        System.out.println("[BookingService] Seat IDs to assign: " + seatIds);
        
        if (seatIds == null || seatIds.isEmpty()) {
            System.out.println("[BookingService] No seat IDs provided for booking ID: " + booking.getId());
            return;
        }
        
        for (Long seatId : seatIds) {
            try {
                Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + seatId));
                
                System.out.println("[BookingService] Found seat: " + seat.getSeatNumber());
                
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
                
                System.out.println("[BookingService] Seat " + seat.getSeatNumber() + " assigned to booking ID: " + booking.getId());
            } catch (Exception e) {
                System.out.println("[BookingService] Error assigning seat ID " + seatId + ": " + e.getMessage());
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
        
        // Lấy ghế đã đặt cho suất chiếu này
        List<ShowtimeSeatBooking> bookedSeats = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
        Set<Long> bookedSeatIds = new HashSet<>();
        for (ShowtimeSeatBooking booking : bookedSeats) {
            if (booking.getStatus() == SeatStatus.BOOKED) {
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
        List<ShowtimeSeatBooking> bookedSeats = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
        List<String> bookedSeatNumbers = new ArrayList<>();
        
        for (ShowtimeSeatBooking booking : bookedSeats) {
            bookedSeatNumbers.add(booking.getSeat().getSeatNumber());
        }
        
        return bookedSeatNumbers;
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
    public List<Map<String, Object>> getUserBookingHistory(String userId) {
        List<Map<String, Object>> history = new ArrayList<>();
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        
        for (Booking booking : bookings) {
            Map<String, Object> bookingInfo = new HashMap<>();
            bookingInfo.put("id", booking.getId());
            bookingInfo.put("totalPrice", booking.getTotalPrice());
            bookingInfo.put("createdAt", booking.getCreatedAt());
            bookingInfo.put("movieTitle", booking.getShowtime().getMovie().getTitle());
            bookingInfo.put("showtime", booking.getShowtime().getStartTime());
            bookingInfo.put("status", booking.getStatus());
            
            history.add(bookingInfo);
        }
        
        return history;
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
            if (existingBooking != null && existingBooking.getStatus() == SeatStatus.BOOKED) {
                return false; // Seat is already booked
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
            seatBooking.setStatus(SeatStatus.BOOKED);
            
            showtimeSeatBookingRepository.save(seatBooking);
        }
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
        Booking booking = getBookingByTxnRef(txnRef);
        
        // Update booking status to CONFIRMED
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);
        
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
        System.out.println("🎯 [BOOKING] Email will be handled by frontend with QR code");
        
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

        BookingDetailsResponse response = new BookingDetailsResponse();
        response.setId(booking.getId());

        // Map MovieDTO
        Movie movie = booking.getShowtime().getMovie();
        MovieDTO movieDTO = new MovieDTO();
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
        response.setMovie(movieDTO);

        // Map ShowtimeDTO
        Showtime showtime = booking.getShowtime();
        ShowtimeDTO showtimeDTO = new ShowtimeDTO();
        showtimeDTO.setStartTime(showtime.getStartTime());
        showtimeDTO.setEndTime(showtime.getEndTime());
        showtimeDTO.setRoomId(showtime.getRoom().getId());
        showtimeDTO.setMovieId(showtime.getMovie().getId());
        
        // Map RoomDTO with Cinema info
        Room room = showtime.getRoom();
        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setName(room.getName());
        roomDTO.setCapacity(room.getCapacity());
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
        showtimeDTO.setRoom(roomDTO);
        response.setShowtime(showtimeDTO);

        // Map OrderDTO
        Order order = booking.getOrder();
        if (order != null) {
            OrderDTO orderDTO = new OrderDTO();
            orderDTO.setUserId(order.getUser() != null ? order.getUser().getId().toString() : null);
            orderDTO.setShowtimeId(showtime.getId());
            // Use booking totalPrice instead of order totalPrice to fix price mismatch
            orderDTO.setTotalPrice(booking.getTotalPrice());
            orderDTO.setCustomerEmail(order.getCustomerEmail());
            orderDTO.setCustomerName(booking.getCustomerName());
            orderDTO.setCustomerPhone(booking.getCustomerPhone());
            orderDTO.setCustomerAddress(booking.getCustomerAddress());

            // Map tickets
            List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
            // Use a set to avoid duplicate seats
            Set<Long> seatIdsSet = new HashSet<>();
            List<TicketDTO> ticketDTOs = new ArrayList<>();
            for (Ticket ticket : tickets) {
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
                ticketDTO.setSeatId(ticket.getSeat().getId());
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
            }
            orderDTO.setTickets(ticketDTOs);

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

}
