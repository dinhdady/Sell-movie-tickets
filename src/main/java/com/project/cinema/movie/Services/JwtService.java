package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Token;
import com.project.cinema.movie.Repositories.TokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY = "DgFzRrJYPW5Lu2R1jNgREK5ibzUMZ+2PRsdmdYmuvtA=";
    private final TokenRepository tokenRepository;
    private static final Long accessExpirationTime = 3600000L;
    private static final Long refreshExpirationTime = 1296000000L;
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    public JwtService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }
    public String extractUsername(String token) {
        return Jwts.parser().setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    public boolean isValid(String accessToken, String refreshToken, org.springframework.security.core.userdetails.UserDetails user) {
        String usernameFromAccessToken = extractUsername(accessToken);

        // Kiểm tra accessToken
        boolean isAccessTokenValid = usernameFromAccessToken.equals(user.getUsername())
                && !isTokenExpired(accessToken);

        // Kiểm tra refreshToken
        boolean isRefreshTokenValid = tokenRepository
                .findByRefreshToken(refreshToken)
                .map(t -> !t.isRevoked())
                .orElse(false);

        // Cả accessToken và refreshToken đều phải hợp lệ
        return isAccessTokenValid && isRefreshTokenValid;
    }

//    private Date extractExpiration(String token) {
//        return extractClaim(token, Claims::getExpiration);
//    }
    // Đã loại bỏ setAccessTokenCookie - không dùng cookie cho JWT nữa
    public String generateAccessToken(UserDetails userDetails) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expDate = new Date(nowMillis + accessExpirationTime);

        String role = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No role found for the user"));

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("role", role)
                .claim("token_type", "access")
                .setIssuer("movie")
                .setIssuedAt(now)
                .setExpiration(expDate)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public boolean verifyToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Date expiration = claims.getExpiration();
            Date now = new Date();

            if (expiration.before(now)) {
                logger.warn("[JWT] Token expired at {}", expiration);
                return false;
            }

            return true;
        } catch (JwtException e) {
            logger.error("[JWT] Invalid token: {}", e.getMessage());
            return false;
        }
        }
    // Đã loại bỏ setRefreshTokenCookie - không dùng cookie cho JWT nữa
    public String generateRefreshToken(UserDetails userDetails) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expDate = new Date(nowMillis + refreshExpirationTime);

        String role = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No role found for the user"));

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("role", role)
                .claim("token_type", "refresh")
                .setIssuer("movie")
                .setIssuedAt(now)
                .setExpiration(expDate)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }



    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY));
    }
    public Optional<Token> findByRefreshToken(String refreshToken){
        return tokenRepository.findByRefreshToken(refreshToken);
    }
    public void deleteTokenByRefreshToken(String token){
        tokenRepository.deleteTokenByRefreshToken(token);
    }
    public boolean isAccessToken(String token) {
        if (token == null || token.isEmpty()) {
            return false; // Token là null hoặc rỗng
        }

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY) // Sử dụng trực tiếp SECRET_KEY
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Kiểm tra thời gian hết hạn
            Date expiration = claims.getExpiration();
            if (expiration != null && expiration.before(new Date())) {
                return false; // Token đã hết hạn
            }

            // Kiểm tra claim "token_type"
            String tokenType = claims.get("token_type", String.class);
            if (tokenType == null) {
                return false; // Nếu không có claim "token_type", coi là không hợp lệ
            }
            return "access".equals(tokenType);
        } catch (ExpiredJwtException e) {
            // Token đã hết hạn
            return false;
        } catch (MalformedJwtException e) {
            // Token không đúng định dạng
            return false;
        } catch (SignatureException e) {
            // Chữ ký không hợp lệ
            return false;
        } catch (IllegalArgumentException e) {
            // Token là null hoặc rỗng
            return false;
        } catch (JwtException e) {
            // Các lỗi JWT khác
            return false;
        }
    }
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    // Hàm kiểm tra token đã hết hạn hay chưa
    public boolean isTokenExpired(String token) {
        try {
            Date exp = extractClaims(token).getExpiration();
            return exp.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (JwtException e) {
            return true;
        }
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public void revokeRefreshToken(String refreshToken) {
        // Tìm refresh token trong database
        Optional<Token> tokenOpt = tokenRepository.findByRefreshToken(refreshToken);

        if (tokenOpt.isPresent()) {
            Token token = tokenOpt.get();
            // Đánh dấu token là đã hủy
            token.setRevoked(true);
            tokenRepository.save(token);
        } else {
            throw new RuntimeException("Refresh token not found");
        }
    }
}
