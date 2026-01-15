package com.project.cinema.movie.Config;

import com.project.cinema.movie.Filter.JwtAuthenticationFilter;
import com.project.cinema.movie.Services.UserDetailsServiceImp;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

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
        http
                // API dùng JWT -> tắt CSRF
                .csrf(csrf -> csrf.disable())

                // CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Static
                        .requestMatchers("/favicon.ico", "/index.html").permitAll()
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

                        .requestMatchers("/api/auth/**").permitAll()

                        // Public movie/home/event/ratings...
                        .requestMatchers(
                                "/api/home/**",
                                "/api/movie/**",
                                "/api/ratings/movie/**",
                                "/api/event/**"
                        ).permitAll()

                        .requestMatchers("/api/vnpay/return", "/api/vnpayment/return").permitAll()

                        // Test public
                        .requestMatchers("/api/testing/**", "/api/test/**").permitAll()

                        // Payment yêu cầu USER
                        .requestMatchers("/api/payment/**").hasRole("USER")

                        // Admin
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .userDetailsService(userDetailsService)

                // JWT filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // Exception handling
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            if (response.isCommitted()) return;

                            String uri = request.getRequestURI();
                            boolean isApi = uri.startsWith("/api/");

                            if (isApi) {
                                response.setStatus(HttpStatus.FORBIDDEN.value());
                                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                                response.getWriter().write("{\"status\":\"ERROR\",\"message\":\"Access denied\",\"code\":\"ACCESS_DENIED\"}");
                            } else {
                                response.sendRedirect("/api/home");
                            }
                        })
                )

                // Logout
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .addLogoutHandler(logoutHandler)
                        .deleteCookies("accessToken", "refreshToken")
                        .logoutSuccessHandler(logoutSuccessHandler())
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // ✅ Dùng originPatterns để hỗ trợ localhost:* khi dev
        cfg.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://192.168.*.*:*"
        ));

        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    private LogoutSuccessHandler logoutSuccessHandler() {
        SimpleUrlLogoutSuccessHandler handler = new SimpleUrlLogoutSuccessHandler();
        handler.setDefaultTargetUrl("/api/home");
        return handler;
    }

    // Custom AuthenticationEntryPoint
    private static class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
        @Override
        public void commence(HttpServletRequest request, HttpServletResponse response,
                             AuthenticationException authException) throws IOException, ServletException {

            if (response.isCommitted()) return;

            String uri = request.getRequestURI();
            boolean isApi = uri.startsWith("/api/");

            if (isApi) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.getWriter().write("{\"status\":\"ERROR\",\"message\":\"Unauthorized\",\"code\":\"UNAUTHORIZED\"}");
            } else {
                response.sendRedirect("/api/home");
            }
        }
    }
}
