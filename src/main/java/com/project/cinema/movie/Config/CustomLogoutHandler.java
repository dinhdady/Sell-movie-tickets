package com.project.cinema.movie.Config;

import com.project.cinema.movie.Models.Token;
import com.project.cinema.movie.Repositories.TokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;

@Component
@Configuration
public class CustomLogoutHandler implements LogoutHandler {
    private final TokenRepository tokenRepository;

    public CustomLogoutHandler(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {
        String authHeader = request.getHeader("Authorization");

        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }

        String token = authHeader.substring(7);
        Token storedToken = tokenRepository.findByRefreshToken(token).orElse(null);
        if(storedToken != null) {
            if (storedToken.isRevoked()) throw new RuntimeException("This user has logged out!");
            storedToken.setRevoked(true);
            tokenRepository.save(storedToken);
        }
    }
}