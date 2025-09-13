package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImp implements UserDetailsService {

    private final UserRepository repository;
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImp.class);

    public UserDetailsServiceImp(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public User loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Loading user by username: {}", username);
        User user = repository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });
        
        logger.info("User loaded successfully: {} with role: {}", username, user.getRole());
        return user;
    }
}
