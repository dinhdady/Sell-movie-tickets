package com.project.cinema.movie.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig{
    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addViewControllers(ViewControllerRegistry registry) {
                // Forward all top-level routes not containing a dot (.) and NOT starting with /api to index.html
                registry.addViewController("/{spring:^(?!api$)[^\\.]+}").setViewName("forward:/index.html");
                registry.addViewController("/reset-password").setViewName("forward:/index.html");
                registry.addViewController("/movies/{spring:[^\\.]+}").setViewName("forward:/index.html");
                registry.addViewController("/admin/{spring:[^\\.]+}").setViewName("forward:/index.html");
                registry.addViewController("/booking").setViewName("forward:/index.html");
                // Add more as needed for your Angular routes
            }
        };
    }


}