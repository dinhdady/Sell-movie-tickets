package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailsResponse {

    private Long id;                 // id của booking
    private MovieDTO movie;           // thông tin phim
    private ShowtimeDTO showtime;     // thông tin suất chiếu
    private OrderDTO order;           // thông tin order và ticket
    private String customerName;      // tên khách đặt
    private String customerEmail;     // email khách đặt
    private String customerPhone;     // số điện thoại khách đặt
    private String customerAddress;   // địa chỉ khách đặt
    private String paymentStatus;     // trạng thái thanh toán
    private String paymentMethod;     // phương thức thanh toán
    private double totalPrice;        // tổng tiền
    private String createdAt;         // ngày tạo booking
}