package com.project.cinema.movie.Filter;

import com.project.cinema.movie.Services.JwtService;
import com.project.cinema.movie.Services.UserDetailsServiceImp;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImp userDetailsService;
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsServiceImp userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        boolean skip =
                path.startsWith("/api/auth/")      // ✅ bỏ qua toàn bộ auth (bao gồm google/exchange)
                        || path.equals("/api/home")
                        || path.equals("/")
                        || path.equals("/api/vnpayment/return")
                        || path.equals("/api/vnpay/return")
                        || path.startsWith("/api/test/")
                        || "OPTIONS".equalsIgnoreCase(request.getMethod()); // ✅ cho CORS preflight

        System.out.println("[JWT Filter] Request path: " + path + ", shouldNotFilter(return): " + skip);
        return skip;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        System.out.println("[JWT Filter] Processing request: " + request.getRequestURI());
        
        String token = getJwtFromRequest(request); // ✅ Dùng hàm đã hỗ trợ header + cookie

        if (token == null) {
            System.out.println("[JWT Filter] No token found, continuing filter chain");
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("[JWT Filter] Token found, processing authentication");

        String username = jwtService.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtService.isAccessToken(token)) {
                System.out.println("[JWT Filter] Token is not access token, continuing filter chain");
                // Don't write to response directly, let Spring Security handle it
                filterChain.doFilter(request, response);
                return;
            }

            if (jwtService.verifyToken(token)) {
                setAuthentication(request, userDetails); // ✅ Gán quyền
            } else {
                // Token hết hạn hoặc không hợp lệ, nhưng không trả về lỗi ngay lập tức
                System.out.println("[JWT Filter] Token expired or invalid, not setting authentication. Token: " + token);
                // Không set authentication, nhưng cũng không trả về lỗi
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(HttpServletRequest request, UserDetails userDetails) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // Nếu bạn dùng cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

}
