package com.project.cinema.movie.Models;

public enum PaymentMethod {
    VNPAY("VNPay", "Thanh toán qua VNPay"),
    MOMO("MoMo", "Thanh toán qua MoMo"),
    ZALOPAY("ZaloPay", "Thanh toán qua ZaloPay"),
    BANKING("Banking", "Chuyển khoản ngân hàng"),
    CREDIT_CARD("CreditCard", "Thẻ tín dụng");

    private final String code;
    private final String description;

    PaymentMethod(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
