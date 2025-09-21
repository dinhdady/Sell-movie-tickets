package com.project.cinema.movie.Config;

import com.project.cinema.movie.Filter.JwtAuthenticationFilter;
import com.project.cinema.movie.Services.UserDetailsServiceImp;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
        private static final String[] PUBLIC_URLS = {
                "/api/auth/**",
                "/api/home/**",
                "/api/movie/now-showing",
                "/api/movie/coming-soon",
                "/api/movie/genres",
                "/api/movie/by-category",
                "/api/movie/by-genre/**",
                "/api/movie/*/showtimes",
                "/api/movie/*",
                "/api/movie", // <-- Thêm dòng này để công khai endpoint lấy tất cả phim
                "/api/movie/**", // <-- Thêm dòng này để công khai mọi endpoint con của /api/movie
                "/api/cinema",
                "/api/room",
                "/api/cinema",
                "/api/seat",
                "/api/booking/showtime/*/seats",
                "/api/vnpay/**",
                "/api/booking/**",
                "/api/testing/**" // <-- Thêm dòng này để công khai test endpoints
        };

        private static final String ADMIN_URLS = "/admin/**";
        private static final String[] USER_URLS = {"/cart/**",
                "/api/payment/create-payment/**",
                "/api/testing/**"
        };

        private final UserDetailsServiceImp userDetailsService;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CustomLogoutHandler logoutHandler;

        public SecurityConfig(UserDetailsServiceImp userDetailsService,
                              JwtAuthenticationFilter jwtAuthenticationFilter,
                              CustomLogoutHandler logoutHandler) {
            this.userDetailsService = userDetailsService;
            this.jwtAuthenticationFilter = jwtAuthenticationFilter;
            this.logoutHandler = logoutHandler;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            configureCsrf(http);
            configureCors(http);
            configureAuthorization(http);
            configureSessionManagement(http);
            configureExceptionHandling(http);
            configureLogout(http);
            
            // Kích hoạt JWT Filter
            http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
            return configuration.getAuthenticationManager();
        }

        private void configureCsrf(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable);
        }

        private void configureCors(HttpSecurity http) throws Exception {
            http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration configuration = new CorsConfiguration();
            configuration.setAllowedOriginPatterns(java.util.Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://localhost:5173"
            ));
            configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
            configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
            configuration.setAllowCredentials(true);
            configuration.setMaxAge(3600L);
            
            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
        }

        private void configureAuthorization(HttpSecurity http) throws Exception {
            http.authorizeHttpRequests(request -> request
                    .requestMatchers(PUBLIC_URLS).permitAll()
                    .requestMatchers("/favicon.ico","/index.html").permitAll()
                    .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                    .requestMatchers("/api/vnpay/return", "/api/vnpayment/return").permitAll() // Chỉ cho phép public callback
                    .requestMatchers("/api/vnpay/test-callback").permitAll() // Test callback
                    .requestMatchers("/api/vnpay/**").authenticated() // Các endpoint còn lại phải xác thực
                    .requestMatchers("/api/payment/**").hasRole("USER")
                    .requestMatchers(ADMIN_URLS).hasRole("ADMIN")
                    .requestMatchers(USER_URLS).hasRole("USER")
                    .anyRequest().authenticated()
            ).userDetailsService(userDetailsService);
        }

        private void configureSessionManagement(HttpSecurity http) throws Exception {
            http.sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        }

    private void configureExceptionHandling(HttpSecurity http) throws Exception {
        http.exceptionHandling(exception -> exception
                // Sử dụng custom AuthenticationEntryPoint
                .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                // Trả về JSON cho API requests khi không đủ quyền
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    String requestURI = request.getRequestURI();
                    boolean isApiRequest = requestURI.startsWith("/api/");
                    System.out.println("[AccessDeniedHandler] URI: " + requestURI + ", isApiRequest: " + isApiRequest);
                    
                    if (response.isCommitted()) {
                        System.out.println("[AccessDeniedHandler] Response already committed, skipping");
                        return;
                    }
                    
                    if (isApiRequest) {
                        response.setStatus(HttpStatus.FORBIDDEN.value());
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                        String jsonResponse = "{\"status\":\"ERROR\",\"message\":\"Access denied\",\"code\":\"ACCESS_DENIED\"}";
                        try {
                            response.getWriter().write(jsonResponse);
                        } catch (IOException e) {
                            System.out.println("[AccessDeniedHandler] Error writing response: " + e.getMessage());
                        }
                    } else {
                        System.out.println("[AccessDeniedHandler] Redirecting to /api/home");
                        try {
                            response.sendRedirect("/api/home");
                        } catch (IOException e) {
                            System.out.println("[AccessDeniedHandler] Error redirecting: " + e.getMessage());
                        }
                    }
                })
        );
    }
        private void configureLogout(HttpSecurity http) throws Exception {
            http.logout(logoutConfigurer -> logoutConfigurer
                    .logoutUrl("/logout")
                    .addLogoutHandler(logoutHandler)
                    .deleteCookies("accessToken", "refreshToken")
                    .logoutSuccessHandler(logoutSuccessHandler()));
        }

        private LogoutSuccessHandler logoutSuccessHandler() {
            SimpleUrlLogoutSuccessHandler handler = new SimpleUrlLogoutSuccessHandler();
            handler.setDefaultTargetUrl("/api/home");
            return handler;
        }

        // Custom AuthenticationEntryPoint để xử lý token hết hạn
        private static class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
            @Override
            public void commence(HttpServletRequest request, HttpServletResponse response,
                               AuthenticationException authException) throws IOException, ServletException {
                String requestURI = request.getRequestURI();
                String acceptHeader = request.getHeader("Accept");
                String xRequestedWith = request.getHeader("X-Requested-With");
                boolean isApiRequest = requestURI.startsWith("/api/")
                        || (acceptHeader != null && acceptHeader.contains("application/json"))
                        || (xRequestedWith != null && xRequestedWith.equalsIgnoreCase("XMLHttpRequest"));
                boolean isVnpayCallback = requestURI.contains("/api/vnpay/return");
                
                System.out.println("[AuthenticationEntryPoint] URI: " + requestURI + ", isApiRequest: " + isApiRequest + ", isVnpayCallback: " + isVnpayCallback + ", Exception: " + authException.getMessage());
                if (response.isCommitted()) {
                    System.out.println("[AuthenticationEntryPoint] Response already committed, skipping");
                    return;
                }
                
                // Xử lý VNPay callback đặc biệt
                if (isVnpayCallback) {
                    System.out.println("[AuthenticationEntryPoint] VNPay callback detected, allowing access");
                    // Cho phép VNPay callback truy cập mà không cần authentication
                    return;
                }
                
                if (isApiRequest) {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    String jsonResponse = "{\"status\":\"ERROR\",\"message\":\"Token expired or invalid\",\"code\":\"TOKEN_EXPIRED\"}";
                    try {
                        response.getWriter().write(jsonResponse);
                    } catch (IOException e) {
                        System.out.println("[AuthenticationEntryPoint] Error writing response: " + e.getMessage());
                    }
                } else {
                    System.out.println("[AuthenticationEntryPoint] Redirecting to /api/home");
                    try {
                        response.sendRedirect("/api/home");
                    } catch (IOException e) {
                        System.out.println("[AuthenticationEntryPoint] Error redirecting: " + e.getMessage());
                    }
                }
            }
        }
}

