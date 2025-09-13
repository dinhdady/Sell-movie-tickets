package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.AuthRequest;
import com.project.cinema.movie.DTO.RegisterRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/api/auth")
public class RenderAuth {
    @GetMapping
    public String authenticationPage(@RequestParam(name = "state", required = false) String state, Model model) {
        model.addAttribute("loginRequest", new AuthRequest()); // Thêm object vào model
        model.addAttribute("registerRequest", new RegisterRequest());
        model.addAttribute("state", state);
        return "/auth/login";
    }

    @GetMapping("/restored-password-method")
    public String forgotPasswordPage() {
        return "/auth/restorePasswordPage";
    }

    @GetMapping("/reset-page")
    public String resetPage(@RequestParam String token, Model model) {
        model.addAttribute("token",token);
        return "/auth/resetPage";
    }
}