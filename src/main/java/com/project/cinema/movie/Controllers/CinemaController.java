package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.Cinema;
import com.project.cinema.movie.Models.CinemaType;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.CinemaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cinema")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5177", "http://127.0.0.1:5177"}, allowCredentials = "true")
public class CinemaController {
    @Autowired
    private CinemaService cinemaService;

    @GetMapping
    public ResponseEntity<ResponseObject> getAllCinemas(){
        List<Cinema> cinemas = cinemaService.getAllCinemas();
        return ResponseEntity.ok(new ResponseObject("SUCCESS", "Cinemas retrieved successfully!", cinemas));
    }
    @GetMapping("/{id}")
    public Cinema getCinemaById(@PathVariable Long id){
        return cinemaService.getCinemaById(id);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("")
    public ResponseEntity<ResponseObject> createCinema(@RequestBody Cinema cinema){
        Cinema newCinema = cinemaService.createCinema(cinema);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject("201", "Cinema created successfully!", newCinema));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteCinema(@PathVariable Long id){
        cinemaService.deleteCinema(id);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateCinema(@PathVariable Long id, @RequestBody Cinema cinema){
        Cinema newCinema = cinemaService.updateCinema(id,cinema);
        return newCinema != null? ResponseEntity.status(HttpStatus.CREATED).body(new ResponseObject("201","Updating cinema successfully!",cinema))
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseObject("404", "Cannot find Cinema!", null));
    }
//    @GetMapping("/special/3d")
//    public List<Cinema> getCinemaByCinemaType(@RequestParam CinemaType cinemaType){
//        return cinemaService.getCinemasByType(cinemaType);
//    }
}
