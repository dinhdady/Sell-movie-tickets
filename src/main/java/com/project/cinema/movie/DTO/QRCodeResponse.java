package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class QRCodeResponse {
    private boolean success; // Trạng thái thành công hay thất bại
    private String message;  // Thông báo phản hồi
    private Long ticketId;   // ID của vé
    private String username; // Tên người dùng đặt vé
    private String movieTitle; // Tên phim
    private Date showtime;    // Thời gian chiếu
    private String status;   // Trạng thái của vé (PAID, USED, v.v.)
}

