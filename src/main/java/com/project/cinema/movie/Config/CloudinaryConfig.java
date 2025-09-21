package com.project.cinema.movie.Config;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

 @Configuration
public class CloudinaryConfig {
     @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dp9ltogc9",
                "api_key", "587857755213897",
                "api_secret", "o80O5e-0ZxH1jBmDWoJb_EovUBc",
                "secure",true));

    }
}