package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.Cinema;
import com.project.cinema.movie.Models.CinemaType;
import com.project.cinema.movie.Services.CinemaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/testing")
public class testApi {
    @GetMapping
    public String testing(){
        return "hello";
    }

}
