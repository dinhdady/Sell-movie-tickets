package com.project.cinema.movie.Config;

import com.project.cinema.movie.Models.FilmRating;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
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
            
            @Override
            public void addFormatters(FormatterRegistry registry) {
                // Register FilmRating converter
                registry.addConverter(new Converter<String, FilmRating>() {
                    @Override
                    public FilmRating convert(String source) {
                        System.out.println("[WebConfig] Converting FilmRating: '" + source + "'");
                        if (source == null || source.trim().isEmpty()) {
                            return null;
                        }
                        try {
                            return FilmRating.fromValue(source);
                        } catch (Exception e) {
                            System.err.println("[WebConfig] FilmRating conversion failed: " + e.getMessage());
                            return null;
                        }
                    }
                });
            }
        };
    }


}