package com.project.cinema.movie.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OTPVerificationRequest {
    @NotBlank(message = "OTP không được để trống")
    @Pattern(regexp = "\\d{6}", message = "OTP phải có đúng 6 chữ số")
    private String otp;
}
