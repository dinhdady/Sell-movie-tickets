package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.AuthenticationResponse;
import com.project.cinema.movie.DTO.GoogleAuthRequest;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Services.AuthenticationService;
import com.project.cinema.movie.Services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class GoogleAuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthController.class);
    
    @Autowired
    private AuthenticationService authenticationService;
    
    @Autowired
    private UserService userService;
    
    /**
     * Google OAuth login endpoint
     * @param request Google auth request with Google ID token
     * @return ResponseEntity with authentication response
     */
    @PostMapping("/google-login")
    public ResponseEntity<ResponseObject> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        try {
            logger.info("Google login attempt for email: {}", request.getEmail());
            
            // Check if user exists by email
            Optional<User> existingUser = userService.findByEmail(request.getEmail());
            
            if (existingUser.isPresent()) {
                // User exists, authenticate them
                User user = existingUser.get();
                logger.info("Existing user found, authenticating: {}", user.getUsername());
                
                // Generate tokens for existing user
                AuthenticationResponse authResponse = authenticationService.generateTokensForUser(user);
                return ResponseEntity.ok(new ResponseObject("SUCCESS", "Google login successful", authResponse));
            } else {
                // User doesn't exist, create new user
                logger.info("New user, creating account for: {}", request.getEmail());
                
                // Create new user from Google data
                User newUser = new User();
                newUser.setUsername(request.getEmail()); // Use email as username
                newUser.setEmail(request.getEmail());
                newUser.setFullName(request.getName());
                newUser.setPassword(""); // No password for Google users
                newUser.setRole(com.project.cinema.movie.Models.Role.USER);
                newUser.setActive(true);
                newUser.setEmailVerified(true); // Google users are pre-verified
                
                // Set birthday if provided
                if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
                    try {
                        newUser.setBirthday(java.time.LocalDateTime.parse(request.getBirthday() + "T00:00:00"));
                    } catch (Exception e) {
                        logger.warn("Failed to parse birthday: {}", request.getBirthday());
                    }
                }
                
                // Save new user
                User savedUser = userService.save(newUser);
                logger.info("New user created with ID: {}", savedUser.getId());
                
                // Generate tokens for new user
                AuthenticationResponse authResponse = authenticationService.generateTokensForUser(savedUser);
                return ResponseEntity.ok(new ResponseObject("SUCCESS", "Google registration and login successful", authResponse));
            }
        } catch (Exception e) {
            logger.error("Error during Google login: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("FAILED", "Google login failed: " + e.getMessage(), null));
        }
    }
}
