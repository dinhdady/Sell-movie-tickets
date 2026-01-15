package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.AuthRequest;
import com.project.cinema.movie.DTO.RegisterRequest;
import com.project.cinema.movie.DTO.AuthenticationResponse;
import com.project.cinema.movie.Models.Token;
import com.project.cinema.movie.Models.User;
import com.project.cinema.movie.Repositories.TokenRepository;
import com.project.cinema.movie.Repositories.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserDetailsServiceImp userDetailsService;
    private final TokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 UserService userService,
                                 UserDetailsServiceImp userDetailsService,
                                 TokenRepository tokenRepository,
                                 AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
        this.userDetailsService = userDetailsService;
        this.tokenRepository = tokenRepository;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return new AuthenticationResponse(false, "", "", "User already exists", null);
        }
        userService.register(request);
        return new AuthenticationResponse(true, "", "", "User registration was successful", null);
    }

    public AuthenticationResponse authenticate(AuthRequest request,
                                               HttpServletResponse response,
                                               HttpSession session) {

        if (isBlank(request.getUsername()) || isBlank(request.getPassword())) {
            return new AuthenticationResponse(false, "", "", "Tên đăng nhập hoặc mật khẩu không được để trống", null);
        }

        try {
            log.info("Login attempt for username: {}", request.getUsername());

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(), request.getPassword()
                    )
            );

            User user = userService.findByUsername(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            // Check if email is verified
            if (user.getIsEmailVerified() == null || !user.getIsEmailVerified()) {
                log.warn("Login attempt for unverified email: {}", user.getEmail());
                return new AuthenticationResponse(false, "", "", "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.", null);
            }

            var userDetails = userDetailsService.loadUserByUsername(user.getUsername());

            String accessToken = jwtService.generateAccessToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            log.info("AccessToken generated for {}: {}", user.getUsername(), accessToken);
            log.info("RefreshToken generated for {}: {}", user.getUsername(), refreshToken);

            revokeAllTokens(user);
            saveUserToken(refreshToken, user);

            session.setAttribute("username", user.getUsername());

            return new AuthenticationResponse(true, accessToken, refreshToken, "Đăng nhập thành công!", user);
        } catch (BadCredentialsException e) {
            return handleBadCredentials(request.getUsername());
        }
    }

    private void revokeAllTokens(User user) {
        List<Token> validTokens = tokenRepository.findAllTokensByUser(user.getId());
        if (!validTokens.isEmpty()) {
            validTokens.forEach(t -> t.setRevoked(true));
            tokenRepository.saveAll(validTokens);
        }
    }

    private void saveUserToken(String refreshToken, User user) {
        Token token = new Token();
        token.setRefreshToken(refreshToken);
        token.setUser(user);
        token.setRevoked(false);
        if (token.getExpiresAt() == null) {
            token.setExpiresAt(LocalDateTime.now().plusDays(7));
        }
        log.debug("Saving refresh token for user {}: {}", user.getUsername(), token);
        tokenRepository.save(token);
    }

    private AuthenticationResponse handleBadCredentials(String username) {
        boolean userExists = userService.findByUsername(username).isPresent();
        String message = userExists ? "Mật khẩu không chính xác" : "Người dùng không tồn tại";
        return new AuthenticationResponse(false, "", "", message, null);
    }

    /**
     * Generate tokens for an existing user (for Google OAuth)
     * @param user the user to generate tokens for
     * @return AuthenticationResponse with tokens
     */
    public AuthenticationResponse generateTokensForUser(User user) {
        try {
            revokeAllTokens(user);

            var userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            String accessToken = jwtService.generateAccessToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            saveUserToken(refreshToken, user);

            return new AuthenticationResponse(true, accessToken, refreshToken, "Authentication successful", user);
        } catch (Exception e) {
            log.error("Error generating tokens for user {}: {}", user.getUsername(), e.getMessage(), e);
            return new AuthenticationResponse(false, "", "", "Token generation failed", null);
        }
    }

    public User save(User u){
        return userRepository.save(u);
    }
    private boolean isBlank(String str) {
        return str == null || str.isBlank();
    }
}
