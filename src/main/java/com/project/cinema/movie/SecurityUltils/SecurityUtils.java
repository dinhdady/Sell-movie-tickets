package com.project.cinema.movie.SecurityUltils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
public class SecurityUtils {

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null; // hoặc throw exception tùy logic của bạn
        }
        return authentication.getName();
    }
}
