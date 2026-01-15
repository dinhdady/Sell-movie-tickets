package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.DTO.CinemaDTO;
import com.project.cinema.movie.DTO.MovieDTO;
import com.project.cinema.movie.DTO.OrderDTO;
import com.project.cinema.movie.DTO.RoomDTO;
import com.project.cinema.movie.DTO.SeatDTO;
import com.project.cinema.movie.DTO.ShowtimeDTO;
import com.project.cinema.movie.DTO.TicketDTO;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service; 

import java.util.*;
import java.util.stream.Collectors;
import java.util.Date;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    
    private static final Logger logger = LoggerFactory.getLogger(TicketService.class);
    
    // Lấy tất cả tickets với thông tin đầy đủ (cho admin)
    public List<BookingDetailsResponse> getAllTicketsWithDetails() {
        try {
            List<Ticket> tickets = ticketRepository.findAll();
            logger.info("Found {} tickets in database", tickets.size());
            
            return tickets.stream()
                    .map(this::buildBookingDetailsFromTicket)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching tickets with details", e);
            return new ArrayList<>();
        }
    }
    
    // Lấy tickets của user cụ thể (cho profile)
    public List<BookingDetailsResponse> getTicketsByUserId(String userId) {
        try {
            List<Ticket> userTickets = ticketRepository.findByUserId(userId);
            logger.info("Found {} tickets for user {}", userTickets.size(), userId);
            
            return userTickets.stream()
                    .map(this::buildBookingDetailsFromTicket)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching tickets for user {}", userId, e);
            return new ArrayList<>();
        }
    }
    
    // Lấy tickets theo order ID
    public List<BookingDetailsResponse> getTicketsByOrderId(Long orderId) {
        try {
            List<Ticket> tickets = ticketRepository.findByOrderId(orderId);
            logger.info("Found {} tickets for order {}", tickets.size(), orderId);
            
            return tickets.stream()
                    .map(this::buildBookingDetailsFromTicket)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching tickets for order {}", orderId, e);
            return new ArrayList<>();
        }
    }
    
    // Lấy chi tiết ticket theo ID
    public BookingDetailsResponse getTicketDetailsById(Long ticketId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
            if (ticket == null) {
                throw new RuntimeException("Ticket not found with id: " + ticketId);
            }
            logger.info("Found ticket with ID: {}", ticketId);
            return buildBookingDetailsFromTicket(ticket);
        } catch (Exception e) {
            logger.error("Error fetching ticket details for ID {}", ticketId, e);
            throw e;
        }
    }
    
    // Xây dựng BookingDetailsResponse từ Ticket
    private BookingDetailsResponse buildBookingDetailsFromTicket(Ticket ticket) {
        try {
            BookingDetailsResponse response = new BookingDetailsResponse();
            response.setId(ticket.getId());
            
            // Lấy thông tin Order
            Order order = ticket.getOrder();
            if (order != null) {
                // Lấy thông tin khách hàng - từ User vì Order chỉ có customerEmail
                String customerName = order.getUser() != null ? order.getUser().getFullName() : "N/A";
                String customerPhone = order.getUser() != null ? order.getUser().getPhoneNumber() : "N/A";
                String customerAddress = order.getUser() != null ? order.getUser().getAddress() : "N/A";
                
                response.setCustomerName(customerName);
                response.setCustomerEmail(order.getCustomerEmail());
                response.setCustomerPhone(customerPhone);
                response.setCustomerAddress(customerAddress);
                response.setTotalPrice(order.getTotalPrice());
                response.setPaymentStatus(order.getStatus());
                response.setPaymentMethod("VNPay");
                response.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : "");
                
                // Map OrderDTO
                OrderDTO orderDTO = new OrderDTO();
                orderDTO.setUserId(order.getUser() != null ? order.getUser().getId().toString() : null);
                orderDTO.setTotalPrice(order.getTotalPrice());
                orderDTO.setCustomerEmail(order.getCustomerEmail());
                orderDTO.setCustomerName(customerName);
                orderDTO.setCustomerPhone(customerPhone);
                orderDTO.setCustomerAddress(customerAddress);
                // OrderDTO không có setCreatedAt method
                
                // Thêm ticket vào order
                List<TicketDTO> ticketDetails = new ArrayList<>();
                TicketDTO ticketDetail = new TicketDTO();
                ticketDetail.setId(ticket.getId());
                ticketDetail.setOrderId(order.getId());
                ticketDetail.setSeatId(ticket.getSeat() != null ? ticket.getSeat().getId() : null);
                ticketDetail.setPrice(ticket.getPrice());
                ticketDetail.setToken(ticket.getToken());
                ticketDetail.setStatus(ticket.getStatus() != null ? ticket.getStatus().toString() : "UNKNOWN");
                ticketDetail.setQrCodeUrl(ticket.getQrCodeUrl());
                
                // Thêm thông tin seat
                if (ticket.getSeat() != null) {
                    SeatDTO seatDTO = new SeatDTO();
                    seatDTO.setSeatNumber(ticket.getSeat().getSeatNumber());
                    seatDTO.setSeatType(ticket.getSeat().getSeatType() != null ? ticket.getSeat().getSeatType() : SeatType.REGULAR);
                    seatDTO.setRowNumber(ticket.getSeat().getRowNumber());
                    seatDTO.setColumnNumber(ticket.getSeat().getColumnNumber());
                    seatDTO.setPrice(ticket.getSeat().getPrice());
                    ticketDetail.setSeat(seatDTO);
                }
                
                ticketDetails.add(ticketDetail);
                
                // Set tickets vào order
                orderDTO.setTickets(ticketDetails);
                response.setOrder(orderDTO);
            }
            
            // Lấy thông tin Showtime từ Booking (vì Order không có showtime trực tiếp)
            Showtime showtime = null;
            try {
                if (order != null && order.getBookings() != null && !order.getBookings().isEmpty()) {
                    showtime = order.getBookings().get(0).getShowtime();
                }
            } catch (Exception e) {
                logger.warn("Error accessing showtime for ticket {}: {}", ticket.getId(), e.getMessage());
                // Nếu không thể truy cập showtime, tạo thông tin mặc định
                showtime = null;
            }
            
            if (showtime != null) {
                try {
                    ShowtimeDTO showtimeDTO = new ShowtimeDTO();
                    showtimeDTO.setStartTime(showtime.getStartTime());
                    showtimeDTO.setEndTime(showtime.getEndTime());
                    showtimeDTO.setMovieId(showtime.getMovie() != null ? showtime.getMovie().getId() : null);
                    showtimeDTO.setRoomId(showtime.getRoom() != null ? showtime.getRoom().getId() : null);
                    
                    // Map Room và Cinema
                    if (showtime.getRoom() != null) {
                        Room room = showtime.getRoom();
                        RoomDTO roomDTO = new RoomDTO();
                        roomDTO.setName(room.getName());
                        roomDTO.setCapacity(room.getCapacity());
                        roomDTO.setCinemaId(room.getCinema() != null ? room.getCinema().getId() : null);
                        
                        if (room.getCinema() != null) {
                            Cinema cinema = room.getCinema();
                            CinemaDTO cinemaDTO = new CinemaDTO();
                            cinemaDTO.setName(cinema.getName());
                            cinemaDTO.setAddress(cinema.getAddress());
                            cinemaDTO.setPhone(cinema.getPhone());
                            cinemaDTO.setCinemaType(cinema.getCinemaType());
                            roomDTO.setCinema(cinemaDTO);
                        }
                        
                        showtimeDTO.setRoom(roomDTO);
                    }
                    
                    response.setShowtime(showtimeDTO);
                    
                    // Map Movie
                    if (showtime.getMovie() != null) {
                        Movie movie = showtime.getMovie();
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
                    }
                } catch (Exception e) {
                    logger.warn("Error mapping showtime details for ticket {}: {}", ticket.getId(), e.getMessage());
                    // Tạo thông tin mặc định nếu có lỗi
                    ShowtimeDTO showtimeDTO = new ShowtimeDTO();
                    showtimeDTO.setStartTime(new Date());
                    showtimeDTO.setEndTime(new Date());
                    showtimeDTO.setMovieId(null);
                    showtimeDTO.setRoomId(null);
                    response.setShowtime(showtimeDTO);
                }
            } else {
                // Tạo thông tin mặc định nếu không có showtime
                logger.warn("No showtime found for ticket {}, creating default info", ticket.getId());
                ShowtimeDTO showtimeDTO = new ShowtimeDTO();
                showtimeDTO.setStartTime(new Date());
                showtimeDTO.setEndTime(new Date());
                showtimeDTO.setMovieId(null);
                showtimeDTO.setRoomId(null);
                response.setShowtime(showtimeDTO);
                
                // Tạo thông tin movie mặc định
                MovieDTO movieDTO = new MovieDTO();
                movieDTO.setTitle("Phim không xác định");
                movieDTO.setDescription("Thông tin phim không khả dụng");
                movieDTO.setDuration(0);
                movieDTO.setReleaseDate(new Date());
                movieDTO.setGenre("Không xác định");
                movieDTO.setDirector("Không xác định");
                movieDTO.setTrailerUrl("");
                movieDTO.setLanguage("Không xác định");
                movieDTO.setCast("Không xác định");
                movieDTO.setRating(0.0);
                movieDTO.setStatus("UNKNOWN");
                movieDTO.setPrice(0.0);
                movieDTO.setFilmRating("G");
                response.setMovie(movieDTO);
            }
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error building booking details from ticket {}: {}", ticket.getId(), e.getMessage(), e);
            return null;
        }
    }
}