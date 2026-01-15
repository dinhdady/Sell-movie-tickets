package com.project.cinema.movie.Services;

import com.project.cinema.movie.Config.VNPayConfig;
import com.project.cinema.movie.DTO.VnpayRequest;
import com.project.cinema.movie.DTO.VNPayResponseDTO;
import com.project.cinema.movie.DTO.TicketDTO;
import com.project.cinema.movie.DTO.TicketResponse;
import com.project.cinema.movie.DTO.PaymentRequest;
import com.project.cinema.movie.DTO.PaymentResponse;
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

    @Transactional
    public String createPayment(VnpayRequest paymentRequest) throws UnsupportedEncodingException {
        // Tìm booking
        Booking booking = bookingRepository.findById(paymentRequest.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + paymentRequest.getBookingId()));

        // Sử dụng Order đã tồn tại từ booking
        Order order = booking.getOrder();
        if (order == null) {
            throw new ResourceNotFoundException("Order not found for booking id: " + paymentRequest.getBookingId());
        }
        
        // Cập nhật trạng thái order thành PENDING_PAYMENT nếu chưa có
        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            order.setStatus("PENDING_PAYMENT");
            orderRepository.save(order);
        }
        
        String txnRef = order.getTxnRef();

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
        logger.info("Gia thanh: " + amount);
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
        logger.info("[VNPAY] vnp_ReturnUrl sử dụng: " + VNPayConfig.vnp_ReturnUrl);
        return VNPayConfig.vnp_PayUrl + "?" + query;
    }

    // New method to handle PaymentRequest (for unified payment API)
    public PaymentResponse createPayment(PaymentRequest request) {
        try {
            // Convert PaymentRequest to VnpayRequest
            VnpayRequest vnpayRequest = new VnpayRequest();
            vnpayRequest.setBookingId(request.getBookingId());
            vnpayRequest.setAmount(request.getAmount().toString());
            
            // Call existing createPayment method
            String paymentUrl = createPayment(vnpayRequest);
            
            // Create PaymentResponse
            PaymentResponse response = new PaymentResponse();
            response.setPaymentUrl(paymentUrl);
            response.setTransactionId("VNPAY_" + System.currentTimeMillis());
            response.setPaymentMethod("VNPAY");
            response.setStatus("PENDING");
            response.setMessage("Payment created successfully");
            response.setAmount(request.getAmount().longValue());
            response.setCurrency("VND");
            response.setReturnUrl(request.getReturnUrl());
            response.setCancelUrl(request.getCancelUrl());
            
            return response;
        } catch (Exception e) {
            logger.error("[VNPayService] Error creating payment: {}", e.getMessage());
            throw new RuntimeException("Failed to create VNPay payment: " + e.getMessage());
        }
    }

    // Verify payment method for unified payment API
    public boolean verifyPayment(Map<String, String> params) {
        try {
            // VNPay verification logic can be added here if needed
            // For now, just return true as VNPay handles verification in callback
            return true;
        } catch (Exception e) {
            logger.error("[VNPayService] Error verifying payment: {}", e.getMessage());
            return false;
        }
    }

    public VNPayResponseDTO handlePaymentReturn(Map<String, String> allParams) {
        logger.info("[VNPAY] Callback với params: {}", allParams);
        String responseCode = allParams.get("vnp_ResponseCode");
        String vnp_TxnRef = allParams.get("vnp_TxnRef");
        String vnp_TransactionNo = allParams.get("vnp_TransactionNo");
        logger.info("[VNPAY] responseCode: {}, txnRef: {}, transactionNo: {}", responseCode, vnp_TxnRef, vnp_TransactionNo);

        if (!"00".equals(responseCode)) {
            logger.warn("[VNPAY] Thanh toán thất bại với mã lỗi: {}", responseCode);
            // Cập nhật trạng thái Order là FAILED
            orderRepository.findByTxnRef(vnp_TxnRef).ifPresent(order -> {
                order.setStatus("PAYMENT_FAILED");
                orderRepository.save(order);
            });
            VNPayResponseDTO response = new VNPayResponseDTO("failed", "Thanh toán thất bại", vnp_TxnRef, null, null);
            response.setTxnRef(vnp_TxnRef);
            return response;
        }

        try {
            Order order = orderRepository.findByTxnRef(vnp_TxnRef)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + vnp_TxnRef));
            logger.info("[VNPAY] Đã tìm thấy order: {}", order.getId());

            // Lưu transaction_id
            if (vnp_TransactionNo != null && !vnp_TransactionNo.isEmpty()) {
                order.setTransactionId(vnp_TransactionNo);
                order.setStatus("PAID");
                orderRepository.save(order);
                logger.info("[VNPAY] Đã cập nhật transactionId: {} và status: PAID cho order: {}", vnp_TransactionNo, order.getId());
            }

            // Kiểm tra xem đơn hàng đã được xử lý chưa
            if ("PAID".equals(order.getStatus())) {
                logger.warn("[VNPAY] Đơn hàng {} đã được xử lý trước đó.", order.getId());
                
                // Lấy tickets đã được tạo
                List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
                
                if (tickets != null && !tickets.isEmpty()) {
                    logger.info("[VNPAY] Đã tìm thấy {} vé cho order {}", tickets.size(), order.getId());
                    VNPayResponseDTO response = new VNPayResponseDTO("success", "Thanh toán thành công (đã xử lý)", order.getId().toString(), tickets, null);
                    response.setTxnRef(vnp_TxnRef);
                    return response;
                }
            }

            // Sử dụng BookingService để xử lý payment confirmation
            try {
                logger.info("[VNPAY] Calling confirmPaymentAndGenerateTickets for txnRef: {}", vnp_TxnRef);
                Booking updatedBooking = bookingService.confirmPaymentAndGenerateTickets(vnp_TxnRef);
                logger.info("[VNPAY] Successfully confirmed payment and generated tickets for txnRef: {}", vnp_TxnRef);
                
                // Cập nhật lại order status nếu chưa được cập nhật
                if (!"PAID".equals(order.getStatus())) {
                    order.setStatus("PAID");
                    orderRepository.save(order);
                    logger.info("[VNPAY] Đã cập nhật status: PAID cho order: {}", order.getId());
                }
                
                // Lấy tickets đã được tạo
                List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());
                logger.info("[VNPAY] Đã tạo tổng cộng {} vé cho order {}", tickets.size(), order.getId());
                
                VNPayResponseDTO response = new VNPayResponseDTO("success", "Thanh toán thành công", order.getId().toString(), tickets, null);
                response.setTxnRef(vnp_TxnRef);
                return response;
            } catch (Exception e) {
                logger.error("[VNPAY] Error confirming payment: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
            }

        } catch (Exception e) {
            logger.error("[VNPAY] Error processing order: {}", e.getMessage(), e);
            VNPayResponseDTO response = new VNPayResponseDTO("failed", "Error processing order: " + e.getMessage(), vnp_TxnRef, null, null);
            response.setTxnRef(vnp_TxnRef);
            return response;
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
                String qrCode = qrCodeService.generateTicketQRCode(ticket.getId(), ticket.getToken());
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
                            logger.info("[VNPAY] Tìm thấy thông tin phim: {}", movieTitle);
                        } else {
                            logger.warn("[VNPAY] Không tìm thấy thông tin phim cho vé");
                            // Tìm thông tin phim từ showtime
                            if (showtime.getMovie() != null) {
                                movieTitle = showtime.getMovie().getTitle();
                                logger.info("[VNPAY] Tìm thấy thông tin phim từ showtime: {}", movieTitle);
                            }
                        }
                        
                        if (cinema != null) {
                            cinemaName = cinema.getName();
                            logger.info("[VNPAY] Tìm thấy thông tin rạp: {}", cinemaName);
                        } else {
                            logger.warn("[VNPAY] Không tìm thấy thông tin rạp cho vé");
                        }
                        
                        if (room != null) {
                            roomName = room.getName();
                            logger.info("[VNPAY] Tìm thấy thông tin phòng: {}", roomName);
                        } else {
                            logger.warn("[VNPAY] Không tìm thấy thông tin phòng cho vé");
                        }
                    } else {
                        logger.warn("[VNPAY] Không tìm thấy thông tin suất chiếu cho vé");
                    }
                } else {
                    logger.warn("[VNPAY] Không tìm thấy thông tin đặt vé cho order");
                }
            } else {
                logger.warn("[VNPAY] Không tìm thấy vé nào cho order");
            }

            VNPayResponseDTO response = new VNPayResponseDTO("success", "Lấy thông tin vé thành công", orderId, tickets, qrCodes, order.getCustomerEmail(), tickets.size(), movieTitle, cinemaName, roomName, formattedShowtime);
            response.setTxnRef(order.getTxnRef()); // Set txnRef from order
            logger.info("[VNPAY] Thông tin phim trong response: {}", response.getMovieTitle());
            return response;
        } catch (NumberFormatException e) {
            logger.error("[VNPAY] ID đơn hàng không hợp lệ: {}", orderId);
            throw new RuntimeException("ID đơn hàng không hợp lệ: " + orderId);
        } catch (Exception e) {
            logger.error("[VNPAY] Lỗi khi lấy thông tin vé: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi lấy thông tin vé: " + e.getMessage());
        }
    }

}
