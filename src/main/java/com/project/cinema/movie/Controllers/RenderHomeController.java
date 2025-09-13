package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.Movie;
import com.project.cinema.movie.Services.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/home")
public class RenderHomeController {
    @Autowired
    private MovieService movieService;
    @GetMapping
    public String test(@RequestParam(name = "message",required = false) String message,
                       Model model){
        if (message != null) {
            model.addAttribute("message", message);
        }
        List<Movie> movies = movieService.getMoviesReleasedBeforeCurrentDate();
        model.addAttribute("movies",movies);
        return "index";
    }
}
