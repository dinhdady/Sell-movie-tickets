package com.project.cinema.movie.Services;

//import com.project.tickets.movie.Config.CustomUserDetails;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuthenticationService {
    @Autowired
    private UserRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserDetailsServiceImp userDetailsService;
    @Autowired
    private TokenRepository tokenRepository;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);
    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {

        // check if user already exist. if exist than authenticate the user
        if(repository.findByUsername(request.getUsernameR()).isPresent()) {
            return new AuthenticationResponse(false,"","","User already exist");
        }

        User user = new User();
        user =userService.register(request);
        return new AuthenticationResponse(true,"","", "User registration was successful");

    }
    public AuthenticationResponse authenticate(AuthRequest request, HttpServletResponse httpServletResponse, HttpSession httpSession) {
        try {
            System.out.println("[AuthService] Starting authentication for username: " + request.getUsername());
            
            // Thực hiện xác thực người dùng
            // Kiểm tra dữ liệu đầu vào
            if (request.getUsername() == null || request.getUsername().isEmpty() ||
                    request.getPassword() == null || request.getPassword().isEmpty()) {
                System.out.println("[AuthService] Username or password is empty");
                return new AuthenticationResponse(false,"","","Tên đăng nhập hoặc mật khẩu không được để trống");
            }

            logger.info("Login request received for username: {}"+ request.getUsername());
            System.out.println("[AuthService] Calling AuthenticationManager.authenticate()");
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
            System.out.println("[AuthService] AuthenticationManager.authenticate() completed successfully");
            // Lấy thông tin người dùng từ database
            Optional<User> userOpt = userService.findByUsername(request.getUsername());
            if (userOpt.isEmpty()) {
                logger.warn("User not found: {}", request.getUsername());
                return new AuthenticationResponse(false,"","","Người dùng không tồn tại");
            }

            User user = userOpt.get();
            String username = request.getUsername();
            
            // Lấy UserDetails để tạo token
            var userDetails = userDetailsService.loadUserByUsername(username);
            
            // Tạo Access Token và Refresh Token
            String accessToken = jwtService.generateAccessToken(userDetails);
            logger.info("AccessToken: {}",accessToken);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            logger.info("RefreshToken: {}",refreshToken);
            // Thu hồi các token cũ
            revokeAllTokenByUser(user);

            // Lưu refreshToken mới
            saveUserToken(refreshToken, user);
            httpSession.setAttribute("username",username);
            // Không set cookie nữa, chỉ trả về token trong body
            logger.info("User {} authenticated successfully", request.getUsername());

            return new AuthenticationResponse(true,accessToken, refreshToken, "Đăng nhập thành công!");
        } catch (BadCredentialsException e) {
            Optional<User> userOpt = userService.findByUsername(request.getUsername());
            if (userOpt.isEmpty()) {
                return new AuthenticationResponse(false,"","","Người dùng không tồn tại");
            } else {
                return new AuthenticationResponse(false,"","","Mật khẩu không chính xác");
            }
        }
    }

    private void revokeAllTokenByUser(User user) {
        List<Token> validTokens = tokenRepository.findAllTokensByUser(user.getId());
        if(validTokens.isEmpty()) {
            return;
        }

        validTokens.forEach(t-> {
            t.setRevoked(true);
        });

        tokenRepository.saveAll(validTokens);
    }
    public void saveUserToken(String refreshToken, User user) {
        // Tạo một đối tượng Token mới
        Token token = new Token();
        token.setRefreshToken(refreshToken);
        token.setUser(user);
        token.setRevoked(false);
        // Thiết lập thời gian hết hạn (nếu chưa được thiết lập trong constructor)
        if (token.getExpiresAt() == null) {
            token.setExpiresAt(LocalDateTime.now().plusDays(7)); // Thêm 7 ngày vào thời gian hiện tại
        }
        logger.info(token.toString());
        // Lưu token vào database
        tokenRepository.save(token);
    }

}
