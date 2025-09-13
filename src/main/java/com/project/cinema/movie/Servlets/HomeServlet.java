package com.project.cinema.movie.Servlets;

import com.project.cinema.movie.Models.Movie;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@WebServlet(name = "HomeServlet", urlPatterns = {"/home", "/"})
public class HomeServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            // Mock data for demonstration
            List<Movie> allMovies = List.of(
                new Movie("Avengers: Endgame", "Superhero movie", 180, null, "Action", "Directors", null, null, "English", "Cast", 8.5, "NOW_SHOWING", 150000.0, null),
                new Movie("Spider-Man: No Way Home", "Superhero movie", 148, null, "Action", "Directors", null, null, "English", "Cast", 8.2, "NOW_SHOWING", 120000.0, null),
                new Movie("Black Widow", "Superhero movie", 134, null, "Action", "Directors", null, null, "English", "Cast", 6.8, "NOW_SHOWING", 100000.0, null),
                new Movie("Wonder Woman 1984", "Superhero movie", 151, null, "Action", "Directors", null, null, "English", "Cast", 5.4, "NOW_SHOWING", 90000.0, null),
                new Movie("Avatar 2", "Sci-fi movie", 192, null, "Sci-Fi", "James Cameron", null, null, "English", "Cast", 7.8, "COMING_SOON", 200000.0, null),
                new Movie("Dune: Part Two", "Sci-fi movie", 166, null, "Sci-Fi", "Denis Villeneuve", null, null, "English", "Cast", 8.0, "COMING_SOON", 180000.0, null)
            );

            List<Movie> featuredMovies = allMovies.stream()
                    .filter(movie -> "NOW_SHOWING".equals(movie.getStatus()))
                    .limit(8)
                    .collect(Collectors.toList());

            List<Movie> comingSoonMovies = allMovies.stream()
                    .filter(movie -> "COMING_SOON".equals(movie.getStatus()))
                    .limit(8)
                    .collect(Collectors.toList());

            List<String> genres = List.of("Action", "Sci-Fi", "Comedy", "Drama", "Horror");

            Map<String, List<Movie>> moviesByCategory = new HashMap<>();
            for (String genre : genres) {
                List<Movie> moviesInGenre = allMovies.stream()
                        .filter(movie -> movie.getGenre() != null && movie.getGenre().contains(genre))
                        .limit(4)
                        .collect(Collectors.toList());
                moviesByCategory.put(genre, moviesInGenre);
            }

            req.setAttribute("featuredMovies", featuredMovies);
            req.setAttribute("comingSoonMovies", comingSoonMovies);
            req.setAttribute("genres", genres);
            req.setAttribute("genreIcons", getGenreIcons());
            req.setAttribute("moviesByCategory", moviesByCategory);

            req.getRequestDispatcher("/WEB-INF/jsp/home.jsp").forward(req, resp);
        } catch (Exception e) {
            req.setAttribute("error", "Failed to load movies: " + e.getMessage());
            req.getRequestDispatcher("/WEB-INF/jsp/home.jsp").forward(req, resp);
        }
    }

    private Map<String, String> getGenreIcons() {
        Map<String, String> genreIcons = new HashMap<>();
        genreIcons.put("Action", "fas fa-bolt");
        genreIcons.put("Adventure", "fas fa-compass");
        genreIcons.put("Comedy", "fas fa-laugh");
        genreIcons.put("Drama", "fas fa-theater-masks");
        genreIcons.put("Horror", "fas fa-ghost");
        genreIcons.put("Romance", "fas fa-heart");
        genreIcons.put("Sci-Fi", "fas fa-rocket");
        genreIcons.put("Thriller", "fas fa-skull");
        genreIcons.put("Animation", "fas fa-palette");
        genreIcons.put("Documentary", "fas fa-film");
        return genreIcons;
    }
}
