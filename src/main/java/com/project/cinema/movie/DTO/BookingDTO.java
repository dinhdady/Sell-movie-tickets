package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDTO {
    private String userId;
    private Long showtimeId;
    private Long orderId; // Có thể null nếu tạo mới
    private double totalPrice;
    private List<Long> seatIds; // Danh sách ID của các ghế đã chọn
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    private String couponCode; // Mã coupon được áp dụng
}
