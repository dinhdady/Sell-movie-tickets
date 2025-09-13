package com.project.cinema.movie.Services;

import com.project.cinema.movie.Config.VNPayConfig;
import com.project.cinema.movie.DTO.VnpayRequest;
import com.project.cinema.movie.DTO.VNPayResponseDTO;
import com.project.cinema.movie.DTO.TicketDTO;
import com.project.cinema.movie.DTO.TicketResponse;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.BookingRepository;
import com.project.cinema.movie.Repositories.OrderRepository;
import com.project.cinema.movie.Repositories.TicketRepository;
import com.project.cinema.movie.Repositories.SeatRepository;
import com.project.cinema.movie.Repositories.ShowtimeSeatBookingRepository;
import com.project.cinema.movie.Services.QRCodeService;
import com.project.cinema.movie.Services.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import com.project.cinema.movie.Exception.ResourceNotFoundException;

@Service
public class VNPayService {
    private static final Logger logger = LoggerFactory.getLogger(VNPayService.class);
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private QRCodeService qrCodeService;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private SeatRepository seatRepository;
    @Autowired
    private BookingService bookingService;
    @Autowired
    private ShowtimeSeatBookingRepository showtimeSeatBookingRepository;
    @Value("${spring.mail.username}")
    private String fromEmail;

    private void sendTicketEmail(String to, Order order, List<Ticket> tickets, List<String> qrCodes) {
    try {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("Xác nhận đặt vé #" + order.getId());

        // Xây dựng HTML (sử dụng cid thay vì base64)
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>");
        sb.append("<html lang='vi'><head><meta charset='UTF-8'>");
        sb.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        sb.append("<title>Thanh toán thành công</title></head>");
        sb.append("<body style='font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;'>");
        sb.append("<div style='max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);'>");

        // Header
        sb.append("<div style='background:#4CAF50; color:white; text-align:center; padding:20px;'>");
        sb.append("<h2 style='margin:0;'>Thanh toán thành công!</h2>");
        sb.append("</div>");

        // Body
        sb.append("<div style='padding:20px;'>");
        sb.append("<p><b>Mã đơn hàng:</b> ").append(order.getId()).append("</p>");
        sb.append("<p><b>Email:</b> ").append(order.getCustomerEmail()).append("</p>");
        sb.append("<p><b>Số lượng vé:</b> ").append(tickets.size()).append(" vé</p>");

        // Get showtime and room information from the first ticket
        if (!tickets.isEmpty()) {
            Ticket firstTicket = tickets.get(0);
            Order ticketOrder = firstTicket.getOrder();
            if (ticketOrder != null && !ticketOrder.getBookings().isEmpty()) {
                Booking booking = ticketOrder.getBookings().get(0);
                Showtime showtime = booking.getShowtime();
                if (showtime != null) {
                    Movie movie = showtime.getMovie();
                    Room room = showtime.getRoom();
                    Cinema cinema = room != null ? room.getCinema() : null;
                    
                    SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm dd/MM/yyyy");
                    String formattedShowtime = dateFormat.format(showtime.getStartTime());
                    
                    if (movie != null) {
                        sb.append("<p><b>Phim:</b> ").append(movie.getTitle()).append("</p>");
                    }
                    if (cinema != null) {
                        sb.append("<p><b>Rạp:</b> ").append(cinema.getName()).append("</p>");
                    }
                    if (room != null) {
                        sb.append("<p><b>Phòng:</b> ").append(room.getName()).append("</p>");
                    }
                    sb.append("<p><b>Suất chiếu:</b> ").append(formattedShowtime).append("</p>");
                }
            }
        }

        // Ghế
        sb.append("<p><b>Ghế:</b> ");
        for (Ticket t : tickets) {
            sb.append("<span style='display:inline-block; background:#eee; padding:5px 10px; margin:3px; border-radius:4px;'>")
              .append(t.getSeat().getSeatNumber())
              .append("</span>");
        }
        sb.append("</p>");

        // QR Codes
        if (!qrCodes.isEmpty()) {
            sb.append("<div style='margin-top:15px;'><b>Mã QR:</b><br/>");
            for (int i = 0; i < qrCodes.size(); i++) {
                String cid = "qrCode" + i;
                sb.append("<img src='cid:").append(cid)
                  .append("' alt='QR Code Vé ").append(i+1)
                  .append("' style='width:120px;height:120px;margin:5px;border:1px solid #ddd;'/>");
            }
            sb.append("</div>");
        }

        sb.append("<p style='margin-top:20px;'>Vui lòng đưa mã QR này cho nhân viên tại quầy vé.</p>");
        sb.append("</div>"); // End body

        // Footer
        sb.append("<div style='background:#f9f9f9; text-align:center; padding:15px; font-size:13px; color:#777;'>");
        sb.append("<p>Cảm ơn bạn đã sử dụng dịch vụ đặt vé của chúng tôi!</p>");
        sb.append("</div></div></body></html>");

        // Gắn nội dung HTML
        helper.setText(sb.toString(), true);

        // Thêm QR code inline
        for (int i = 0; i < qrCodes.size(); i++) {
            byte[] qrBytes = Base64.getDecoder().decode(qrCodes.get(i));
            helper.addInline("qrCode" + i, new org.springframework.core.io.ByteArrayResource(qrBytes), "image/png");
        }

        mailSender.send(mimeMessage);
        logger.info("[EMAIL] Đã gửi mail HTML có QR code tới {}", to);

    } catch (Exception e) {
        logger.error("[EMAIL] Lỗi gửi mail: {}", e.getMessage(), e);
    }
}

    @Transactional
    public String createPayment(VnpayRequest paymentRequest) throws UnsupportedEncodingException {
        // Tìm booking
        Booking booking = bookingRepository.findById(paymentRequest.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + paymentRequest.getBookingId()));

        // Tạo một Order mới
        Order order = new Order();
        order.setUser(booking.getUser());
        order.setBookings(Collections.singletonList(booking));
        order.setTotalPrice(booking.getTotalPrice());
        order.setStatus("PENDING_PAYMENT");
        order.setCustomerEmail(booking.getCustomerEmail()); // Set the customer email from booking form
        
        // Lưu order để có ID và txnRef
        Order savedOrder = orderRepository.save(order);
        String txnRef = savedOrder.getTxnRef();

        // Gắn order vào booking
        booking.setOrder(savedOrder);
        bookingRepository.save(booking);

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";

        long amount = (long) booking.getTotalPrice() * 100;

        String vnp_TxnRef = txnRef; // Sử dụng txnRef từ Order
        String vnp_IpAddr = "127.0.0.1";
        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        System.out.println("Gia thanh: " + amount);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append('&');
                hashData.append('&');
            }
        }

        if (!query.isEmpty())
            query.setLength(query.length() - 1);
        if (!hashData.isEmpty())
            hashData.setLength(hashData.length() - 1);

        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        System.out.println("[VNPAY] vnp_ReturnUrl sử dụng: " + VNPayConfig.vnp_ReturnUrl);
        return VNPayConfig.vnp_PayUrl + "?" + query;
    }

    public VNPayResponseDTO handlePaymentReturn(Map<String, String> allParams) {
        logger.info("[VNPAY] Callback với params: {}", allParams);
        String responseCode = allParams.get("vnp_ResponseCode");
        String vnp_TxnRef = allParams.get("vnp_TxnRef");
        logger.info("[VNPAY] responseCode: {}, txnRef: {}", responseCode, vnp_TxnRef);

        if (!"00".equals(responseCode)) {
            logger.warn("[VNPAY] Thanh toán thất bại với mã lỗi: {}", responseCode);
            // Cập nhật trạng thái Order là FAILED
            orderRepository.findByTxnRef(vnp_TxnRef).ifPresent(order -> {
                order.setStatus("PAYMENT_FAILED");
                orderRepository.save(order);
            });
            return new VNPayResponseDTO("failed", "Thanh toán thất bại", vnp_TxnRef, null, null);
        }

        try {
            Order order = orderRepository.findByTxnRef(vnp_TxnRef)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + vnp_TxnRef));
            logger.info("[VNPAY] Đã tìm thấy order: {}", order.getId());

            // Kiểm tra xem đơn hàng đã được xử lý chưa
            if ("PAID".equals(order.getStatus())) {
                logger.warn("[VNPAY] Đơn hàng {} đã được xử lý trước đó.", order.getId());
                return new VNPayResponseDTO("success", "Thanh toán thành công (đã xử lý)", order.getId().toString(), order.getTickets(), null);
            }

            order.setStatus("PAID");
            orderRepository.save(order);

            List<Ticket> tickets = new ArrayList<>(); // List to store tickets
            List<String> qrCodes = new ArrayList<>(); // List to store QR codes
            
            for (Booking booking : order.getBookings()) {
                logger.info("[VNPAY] Processing booking ID: {}", booking.getId());
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);

                // Assign seats to booking only after payment confirmation
                List<Long> seatIds = booking.getSeatIds(); // Assuming seatIds field added to Booking model
                if (seatIds != null && !seatIds.isEmpty()) {
                    bookingService.assignSeatsToBooking(booking, seatIds);
                    logger.info("[VNPAY] Assigned seats to booking ID: {}", booking.getId());
                } else {
                    logger.warn("[VNPAY] No seat IDs found for booking ID: {}", booking.getId());
                }

                // Get seats from showtime seat bookings instead of direct seat-booking relationship
                List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByBookingId(booking.getId());
                if (seatBookings.isEmpty()) {
                    logger.warn("[VNPAY] Booking {} không có ghế nào!", booking.getId());
                    continue;
                }
                
                List<Seat> seats = seatBookings.stream()
                    .map(ShowtimeSeatBooking::getSeat)
                    .toList();
                double pricePerTicket = booking.getTotalPrice() / seats.size();

                for (Seat seat : seats) {
                    Ticket ticket = new Ticket();
                    ticket.setOrder(order);
                    ticket.setSeat(seat);
                    ticket.setPrice(pricePerTicket);
                    ticket.setStatus(TicketStatus.PAID);
                    ticket.setUsed(false);
                    
                    // QR code token will be automatically generated by the @PrePersist method
                    ticket = ticketRepository.save(ticket);
                    tickets.add(ticket);
                    
                    // Generate QR code with detailed ticket information
                    String qrText = generateQRCodeText(ticket);
                    String qrCode = qrCodeService.generateQRCodeImage(qrText, 300, 300);
                    qrCode = qrCode.replaceAll("\\s+", ""); // Remove whitespace and line breaks
                    order.setTickets(tickets);
                    orderRepository.save(order);
                    logger.info(order.getCustomerEmail());
                    // Gửi email HTML
                    qrCodes.add(qrCode);
                    
                    logger.info("[VNPAY] Đã tạo ticket {} cho seat {} với mã token: {}", ticket.getId(), seat.getSeatNumber(), ticket.getToken());
                }
            }

            order.setTickets(tickets);
            orderRepository.save(order);
            logger.info("[VNPAY] Đã tạo tổng cộng {} vé cho order {}", tickets.size(), order.getId());

            // Gửi email HTML sau khi tất cả vé và mã QR đã được tạo
            if (order.getCustomerEmail() != null && !qrCodes.isEmpty()) {
                logger.info("[VNPAY] Sending email to: {}", order.getCustomerEmail());
                sendTicketEmail(order.getCustomerEmail(), order, tickets, qrCodes);
            } else {
                logger.warn("[VNPAY] Cannot send email - customerEmail: {}, qrCodes empty: {}", 
                           order.getCustomerEmail(), qrCodes.isEmpty());
            }

            // Extract movie, cinema, room, and showtime information
            String movieTitle = null;
            String cinemaName = null;
            String roomName = null;
            String formattedShowtime = null;
            
            if (!tickets.isEmpty()) {
                Ticket firstTicket = tickets.get(0);
                Order ticketOrder = firstTicket.getOrder();
                if (ticketOrder != null && !ticketOrder.getBookings().isEmpty()) {
                    Booking booking = ticketOrder.getBookings().get(0);
                    Showtime showtime = booking.getShowtime();
                    if (showtime != null) {
                        Movie movie = showtime.getMovie();
                        Room room = showtime.getRoom();
                        Cinema cinema = room != null ? room.getCinema() : null;
                        
                        SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm dd/MM/yyyy");
                        formattedShowtime = dateFormat.format(showtime.getStartTime());
                        
                        if (movie != null) {
                            movieTitle = movie.getTitle();
                        }
                        if (cinema != null) {
                            cinemaName = cinema.getName();
                        }
                        if (room != null) {
                            roomName = room.getName();
                        }
                    }
                }
            }

            VNPayResponseDTO response = new VNPayResponseDTO("success", "Thanh toán thành công", order.getId().toString(), tickets, qrCodes, order.getCustomerEmail(), tickets.size(), movieTitle, cinemaName, roomName, formattedShowtime);
            logger.info("[VNPAY] Response DTO: {}", response);

            return response;

        } catch (Exception e) {
            logger.error("[VNPAY] Lỗi xử lý đơn hàng: {}", e.getMessage(), e);
            return new VNPayResponseDTO("failed", "Lỗi xử lý đơn hàng: " + e.getMessage(), vnp_TxnRef, null, null);
        }
    }

    public VNPayResponseDTO getTicketsByOrderId(String orderId) {
        logger.info("[VNPAY] Lấy thông tin vé cho orderId: {}", orderId);
        try {
            Long orderIdLong = Long.parseLong(orderId);
            Order order = orderRepository.findById(orderIdLong)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

            List<Ticket> tickets = ticketRepository.findByOrderId(orderIdLong);
            logger.info("[VNPAY] Tìm thấy {} vé cho order {}", tickets.size(), orderId);
            
            List<String> qrCodes = new ArrayList<>();
            for (Ticket ticket : tickets) {
                String qrText = generateQRCodeText(ticket);
                String qrCode = qrCodeService.generateQRCodeImage(qrText, 300, 300);
                qrCode = qrCode.replaceAll("\\s+", ""); // Remove whitespace and line breaks
                qrCodes.add(qrCode);
            }
            
            // Extract movie, cinema, room, and showtime information
            String movieTitle = null;
            String cinemaName = null;
            String roomName = null;
            String formattedShowtime = null;
            
            if (!tickets.isEmpty()) {
                Ticket firstTicket = tickets.get(0);
                Order ticketOrder = firstTicket.getOrder();
                if (ticketOrder != null && !ticketOrder.getBookings().isEmpty()) {
                    Booking booking = ticketOrder.getBookings().get(0);
                    Showtime showtime = booking.getShowtime();
                    if (showtime != null) {
                        Movie movie = showtime.getMovie();
                        Room room = showtime.getRoom();
                        Cinema cinema = room != null ? room.getCinema() : null;
                        
                        SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm dd/MM/yyyy");
                        formattedShowtime = dateFormat.format(showtime.getStartTime());
                        
                        if (movie != null) {
                            movieTitle = movie.getTitle();
                        }
                        if (cinema != null) {
                            cinemaName = cinema.getName();
                        }
                        if (room != null) {
                            roomName = room.getName();
                        }
                    }
                }
            }

            return new VNPayResponseDTO("success", "Lấy thông tin vé thành công", orderId, tickets, qrCodes, order.getCustomerEmail(), tickets.size(), movieTitle, cinemaName, roomName, formattedShowtime);
        } catch (NumberFormatException e) {
            logger.error("[VNPAY] ID đơn hàng không hợp lệ: {}", orderId);
            throw new RuntimeException("ID đơn hàng không hợp lệ: " + orderId);
        } catch (Exception e) {
            logger.error("[VNPAY] Lỗi khi lấy thông tin vé: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi lấy thông tin vé: " + e.getMessage());
        }
    }

    private String generateQRCodeText(Ticket ticket) {
        try {
            // Get the booking information from the ticket's order
            Order order = ticket.getOrder();
            if (order == null || order.getBookings() == null || order.getBookings().isEmpty()) {
                return "MaVe=" + ticket.getId() + "|Ghe=" + ticket.getSeat().getSeatNumber();
            }
            
            // Get the first booking (assuming one booking per order for simplicity)
            Booking booking = order.getBookings().get(0);
            Showtime showtime = booking.getShowtime();
            
            if (showtime == null) {
                return "MaVe=" + ticket.getId() + "|Ghe=" + ticket.getSeat().getSeatNumber();
            }
            
            // Get movie, room, and cinema information
            Movie movie = showtime.getMovie();
            Room room = showtime.getRoom();
            Cinema cinema = room != null ? room.getCinema() : null;
            
            // Format the showtime
            SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm dd/MM/yyyy");
            String formattedShowtime = dateFormat.format(showtime.getStartTime());
            
            // Build the QR code text in the specified format
            StringBuilder qrText = new StringBuilder();
            qrText.append("MaVe=").append(ticket.getId());
            
            if (movie != null) {
                qrText.append("|Phim=").append(movie.getTitle());
            }
            
            if (cinema != null) {
                qrText.append("|Rap=").append(cinema.getName());
            }
            
            if (room != null) {
                qrText.append("|Phong=").append(room.getName());
            }
            
            qrText.append("|Ghe=").append(ticket.getSeat().getSeatNumber());
            qrText.append("|Suat=").append(formattedShowtime);
            qrText.append("|Token=").append(ticket.getToken());
            
            return qrText.toString();
            
        } catch (Exception e) {
            logger.error("[VNPAY] Lỗi khi tạo nội dung QR code: {}", e.getMessage(), e);
            // Fallback to simple format if there's an error
            return "MaVe=" + ticket.getId() + "|Ghe=" + ticket.getSeat().getSeatNumber();
        }
    }
}
