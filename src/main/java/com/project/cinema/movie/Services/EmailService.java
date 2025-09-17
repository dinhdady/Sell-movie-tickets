package com.project.cinema.movie.Services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.project.cinema.movie.DTO.SeatDTO;
import com.project.cinema.movie.DTO.TicketDTO;
import com.project.cinema.movie.Models.Booking;
import com.project.cinema.movie.Models.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;
    
    @Autowired
    private QRCodeService qrCodeService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendBookingConfirmation(Booking booking, List<Ticket> tickets) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(booking.getCustomerEmail());
            helper.setSubject("Xác nhận đặt vé - " + booking.getShowtime().getMovie().getTitle());
            Context context = new Context();
            context.setVariable("booking", booking);
            context.setVariable("movie", booking.getShowtime().getMovie());
            context.setVariable("showtime", booking.getShowtime().getShowtimeSeatBookings());
            context.setVariable("cinema", booking.getShowtime().getRoom().getCinema());
            context.setVariable("room", booking.getShowtime().getRoom());

            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
            context.setVariable("showDate", dateFormat.format(booking.getShowtime().getStartTime()));
            context.setVariable("showStartTime", timeFormat.format(booking.getShowtime().getStartTime()));
            context.setVariable("showEndTime", timeFormat.format(booking.getShowtime().getEndTime()));

// ✅ Tạo list TicketDTO có qrCid
            List<TicketDTO> ticketDTOs = new ArrayList<>();
            for (int i = 0; i < tickets.size(); i++) {
                Ticket t = tickets.get(i);

                // Sinh QR từ token
                byte[] qrBytes = qrCodeService.generateQRCodeBytes("TICKET_" + t.getToken());

                String qrBase64 = "data:image/png;base64," +
                        Base64.getEncoder().encodeToString(qrBytes);
                // Map Ticket -> TicketDTO
                SeatDTO seatDTO = new SeatDTO();
                seatDTO.setSeatNumber(t.getSeat().getSeatNumber());
                seatDTO.setRowNumber(t.getSeat().getRowNumber());
                seatDTO.setColumnNumber(t.getSeat().getColumnNumber());
                seatDTO.setRoomId(t.getSeat().getRoom().getId());
                seatDTO.setSeatType(t.getSeat().getSeatType());
                // price not in Seat model, set to 0 or ticket price?
                seatDTO.setPrice(t.getPrice()); // assuming seat price is ticket price

                TicketDTO dto = new TicketDTO(
                        t.getId(),
                        t.getOrder().getId(),
                        t.getSeat().getId(),
                        t.getPrice(),
                        t.getToken(),
                        t.getStatus().toString(),
                        null,          // qrCid
                        qrBase64,      // qrBase64
                        seatDTO
                );

                ticketDTOs.add(dto);
            }

// Truyền list TicketDTO vào template
            context.setVariable("ticketDTOs", ticketDTOs);

            String html = templateEngine.process("booking-confirmation", context);
            helper.setText(html, true);
            mailSender.send(message);

        } catch (MessagingException | WriterException e) {
            // Fallback to simple text email
            sendSimpleBookingConfirmation(booking, tickets);
        }
    }

    private void sendSimpleBookingConfirmation(Booking booking, List<Ticket> tickets) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(booking.getCustomerEmail());
            message.setSubject("Xác nhận đặt vé - " + booking.getShowtime().getMovie().getTitle());

            StringBuilder content = new StringBuilder();
            content.append("Xin chào ").append(booking.getCustomerName()).append(",\n\n");
            content.append("Cảm ơn bạn đã đặt vé tại rạp chiếu phim của chúng tôi!\n\n");
            content.append("THÔNG TIN ĐẶT VÉ:\n");
            content.append("- Phim: ").append(booking.getShowtime().getMovie().getTitle()).append("\n");
            content.append("- Rạp: ").append(booking.getShowtime().getRoom().getCinema().getName()).append("\n");
            content.append("- Phòng: ").append(booking.getShowtime().getRoom().getName()).append("\n");
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
            content.append("- Suất chiếu: ").append(dateFormat.format(booking.getShowtime().getStartTime())).append("\n");
            
            content.append("- Ghế đã đặt: ");
            for (int i = 0; i < tickets.size(); i++) {
                if (i > 0) content.append(", ");
                content.append(tickets.get(i).getSeat().getSeatNumber());
            }
            content.append("\n");
            
            content.append("- Tổng tiền: ").append(String.format("%,.0f", booking.getTotalPrice())).append(" VNĐ\n\n");
            
            content.append("Vui lòng đến rạp trước giờ chiếu 15 phút và xuất trình email này để nhận vé.\n\n");
            content.append("Trân trọng,\n");
            content.append("Đội ngũ Cinema");

            message.setText(content.toString());
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send booking confirmation email: " + e.getMessage());
        }
    }

    public void sendPaymentConfirmation(String email, String customerName, String movieTitle, double amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Xác nhận thanh toán thành công - " + movieTitle);

            StringBuilder content = new StringBuilder();
            content.append("Xin chào ").append(customerName).append(",\n\n");
            content.append("Thanh toán của bạn đã được xử lý thành công!\n\n");
            content.append("- Phim: ").append(movieTitle).append("\n");
            content.append("- Số tiền: ").append(String.format("%,.0f", amount)).append(" VNĐ\n\n");
            content.append("Vé của bạn đã được tạo và sẽ được gửi trong email riêng.\n\n");
            content.append("Trân trọng,\n");
            content.append("Đội ngũ Cinema");

            message.setText(content.toString());
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send payment confirmation email: " + e.getMessage());
        }
    }
}
