package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.BookingDetailsResponse;
import com.project.cinema.movie.DTO.CinemaDTO;
import com.project.cinema.movie.DTO.MovieDTO;
import com.project.cinema.movie.DTO.OrderDTO;
import com.project.cinema.movie.DTO.RoomDTO;
import com.project.cinema.movie.DTO.ShowtimeDTO;
import com.project.cinema.movie.DTO.TicketDetailsResponse;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service; 

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private CinemaRepository cinemaRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private SeatRepository seatRepository;
    
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
    
    // Xây dựng BookingDetailsResponse từ Ticket
    private BookingDetailsResponse buildBookingDetailsFromTicket(Ticket ticket) {
        try {
            BookingDetailsResponse response = new BookingDetailsResponse();
            response.setId(ticket.getId());
            
            // Lấy thông tin Order
            Order order = ticket.getOrder();
            if (order != null) {
                // Lấy thông tin từ User thay vì Order
                String customerName = order.getUser() != null ? order.getUser().getFullName() : "N/A";
                String customerPhone = "N/A"; // User entity không có phone field
                String customerAddress = "N/A"; // User entity không có address field
                
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
                List<TicketDetailsResponse> ticketDetails = new ArrayList<>();
                TicketDetailsResponse ticketDetail = new TicketDetailsResponse();
                ticketDetail.setId(ticket.getId());
                ticketDetail.setOrderId(order.getId());
                // TicketDetailsResponse không có setSeatId method
                ticketDetail.setPrice(ticket.getPrice());
                ticketDetail.setToken(ticket.getToken());
                ticketDetail.setStatus(ticket.getStatus() != null ? ticket.getStatus().toString() : "UNKNOWN");
                ticketDetail.setQrCodeUrl(ticket.getQrCodeUrl());
                ticketDetail.setCreatedAt(ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : "");
                
                // Thêm thông tin seat
                if (ticket.getSeat() != null) {
                    ticketDetail.setSeatNumber(ticket.getSeat().getSeatNumber());
                    ticketDetail.setSeatType(ticket.getSeat().getSeatType() != null ? ticket.getSeat().getSeatType().toString() : "REGULAR");
                    ticketDetail.setRowNumber(ticket.getSeat().getRowNumber());
                    ticketDetail.setColumnNumber(ticket.getSeat().getColumnNumber());
                }
                
                ticketDetails.add(ticketDetail);
                // OrderDTO không có setTickets method với TicketDetailsResponse
                response.setOrder(orderDTO);
            }
            
            // Lấy thông tin Showtime từ Booking (vì Order không có showtime trực tiếp)
            Showtime showtime = null;
            if (order != null && order.getBookings() != null && !order.getBookings().isEmpty()) {
                showtime = order.getBookings().get(0).getShowtime();
            }
            if (showtime != null) {
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
            }
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error building booking details from ticket {}: {}", ticket.getId(), e.getMessage(), e);
            return null;
        }
    }
}