//package com.project.cinema.movie.Controllers;
//
//import com.project.cinema.movie.DTO.QRCodeResponse;
//import com.project.cinema.movie.Models.*;
//import com.project.cinema.movie.Services.QRCodeService;
//import com.project.cinema.movie.Services.TicketService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.Date;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/scan-qr")
//public class QRCodeScanController {
//
//    @Autowired
//    private TicketService ticketService;
//
//    @Autowired
//    private QRCodeService qrCodeDecoderService;
//
//    private static final Logger logger = LoggerFactory.getLogger(QRCodeScanController.class);
//    @PreAuthorize("hasRole('STAFF')")
//    @PostMapping
//    public ResponseEntity<?> scanAndCheckQRCode(@RequestParam("file") MultipartFile file) {
//        try {
//            // 🔹 Bước 1: Giải mã mã QR để lấy token
//            String token = qrCodeDecoderService.decodeQRCode(file);
//
//            Optional<Ticket> ticketOptional = ticketService.findByToken(token);
//            logger.info("Ticket found: " + ticketOptional.orElse(null));
//
//            if (ticketOptional.isEmpty()) {
//                return ResponseEntity.badRequest().body(new QRCodeResponse(
//                        false,
//                        "Mã QR không tồn tại trong hệ thống.",
//                        null, null, null, null, null
//                ));
//            }
//
//            Ticket ticket = ticketOptional.get();
//
//            // 🔹 Bước 2: Kiểm tra xem vé đã được sử dụng chưa
//            if (ticket.isUsed()) {
//                return ResponseEntity.badRequest().body(new QRCodeResponse(
//                        false,
//                        "Mã QR đã được sử dụng trước đó.",
//                        ticket.getId(),
//                        ticket.getOrder().getUser().getUsername(),
//                        null, null,
//                        ticket.getStatus().name()
//                ));
//            }
//
//            // 🔹 Bước 3: Lấy thông tin đơn hàng (Order)
//            Order order = ticket.getOrder();
//            if (order == null || order.getUser() == null) {
//                return ResponseEntity.badRequest().body(new QRCodeResponse(
//                        false,
//                        "Lỗi: Không tìm thấy đơn đặt hàng hoặc người dùng.",
//                        null, null, null, null, null
//                ));
//            }
//
//            // 🔹 Bước 4: Lấy suất chiếu từ `Booking`
//            Showtime showtime = null;
//            for (Booking booking : order.getBookings()) {
//                if (booking.getShowtime() != null) {
//                    showtime = booking.getShowtime();
//                    break;
//                }
//            }
//
//            if (showtime == null || showtime.getMovie() == null) {
//                return ResponseEntity.badRequest().body(new QRCodeResponse(
//                        false,
//                        "Lỗi: Không tìm thấy suất chiếu hoặc phim.",
//                        null, null, null, null, null
//                ));
//            }
//
//            // 🔹 Bước 5: Kiểm tra vé có hợp lệ không
//            if (!isBookingValid(ticket)) {
//                return ResponseEntity.badRequest().body(new QRCodeResponse(
//                        false,
//                        "Mã QR không hợp lệ hoặc đã hết hạn.",
//                        null, null, null, null, null
//                ));
//            }
//
//            // 🔹 Bước 6: Cập nhật trạng thái vé
//            ticket.setUpdatedAt(new Date());
//            ticket.setUsed(true);
//            ticket.setStatus(TicketStatus.USED); // Đặt trạng thái là USED khi quét mã QR thành công
//            ticketService.updateTicket(ticket.getId(), ticket);
//
//            // 🔹 Bước 7: Trả về thông tin xác nhận
//            return ResponseEntity.ok().body(new QRCodeResponse(
//                    true,
//                    "Mã QR hợp lệ. Đặt vé được xác nhận.",
//                    ticket.getId(),
//                    order.getUser().getUsername(),
//                    showtime.getMovie().getTitle(),
//                    showtime.getStartTime(),
//                    ticket.getStatus().name()
//            ));
//
//        } catch (Exception e) {
//            logger.error("Lỗi khi quét hoặc kiểm tra mã QR", e);
//            return ResponseEntity.internalServerError().body(new QRCodeResponse(
//                    false,
//                    "Lỗi khi quét hoặc kiểm tra mã QR: " + e.getMessage(),
//                    null, null, null, null, null
//            ));
//        }
//    }
//
//
//
//    private boolean isBookingValid(Ticket ticket) {
//        // Kiểm tra các điều kiện hợp lệ của đặt vé
//        // Ví dụ: Trạng thái đặt vé phải là CONFIRMED và thời gian hiệu lực chưa hết
//        return ticket.getStatus() == TicketStatus.USED;
//    }
//}