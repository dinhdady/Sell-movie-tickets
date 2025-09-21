package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Booking;
import com.project.cinema.movie.Models.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import java.text.SimpleDateFormat;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Legacy method - no longer used, email is sent from frontend
    @Deprecated
    public void sendBookingConfirmation(Booking booking, List<Ticket> tickets) {
        System.out.println("📧 [EMAIL] Legacy email method called - email should be sent from frontend");
        sendSimpleBookingConfirmation(booking, tickets);
    }

    /**
     * Send booking confirmation with HTML content from frontend
     */
    public void sendBookingConfirmationWithHtml(String toEmail, String subject, String htmlContent) {
        try {
            System.out.println("🎯 [EMAIL] Starting to send email...");
            System.out.println("🎯 [EMAIL] From: " + fromEmail);
            System.out.println("🎯 [EMAIL] To: " + toEmail);
            System.out.println("🎯 [EMAIL] Subject: " + subject);
            System.out.println("🎯 [EMAIL] HTML content length: " + (htmlContent != null ? htmlContent.length() : 0));
            System.out.println("🎯 [EMAIL] HTML content preview: " + (htmlContent != null ? htmlContent.substring(0, Math.min(200, htmlContent.length())) + "..." : "null"));
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            System.out.println("🎯 [EMAIL] Sending message...");
            mailSender.send(message);

            System.out.println("✅ [EMAIL] Sent booking confirmation email with HTML from frontend");
        } catch (Exception e) {
            System.err.println("❌ [EMAIL] Failed to send email with HTML content: " + e.getMessage());
            e.printStackTrace();
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
            System.err.println("Failed to send simple booking confirmation email: " + e.getMessage());
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
