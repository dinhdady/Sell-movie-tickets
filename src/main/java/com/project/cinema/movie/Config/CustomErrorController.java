package com.project.cinema.movie.Config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {
    @RequestMapping("/error")
    public ResponseEntity<?> handleError(HttpServletRequest request) {
        String uri = (String) request.getAttribute("javax.servlet.error.request_uri");
        if (uri != null && uri.startsWith("/api/")) {
            Map<String, Object> body = new HashMap<>();
            body.put("status", "ERROR");
            body.put("message", "Token expired or invalid");
            body.put("code", "TOKEN_EXPIRED");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }
        // fallback: trả về 404 cho các request khác
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not found");
    }
} 