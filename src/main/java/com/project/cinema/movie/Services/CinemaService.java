package com.project.cinema.movie.Services;

import com.project.cinema.movie.Exception.ResourceNotFoundException;
import com.project.cinema.movie.Models.Cinema;
import com.project.cinema.movie.Models.CinemaType;
import com.project.cinema.movie.Repositories.CinemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Service
public class CinemaService {
    @Autowired
    private CinemaRepository cinemaRepository;

    public List<Cinema> getAllCinemas() {
        return cinemaRepository.findAll();
    }

    public Cinema getCinemaById(Long id) {
        return cinemaRepository.findById(id).orElse(null);
    }

    public Cinema createCinema(Cinema cinema) {
        return cinemaRepository.save(cinema);
    }

    public void deleteCinema(Long id) {
        cinemaRepository.deleteById(id);
    }
    public Cinema updateCinema(Long id, Cinema cinemaDetails) {
        return cinemaRepository.findById(id).map(cinema->{
            cinema.setName(cinemaDetails.getName());
            cinema.setAddress(cinemaDetails.getAddress());
            cinema.setPhone(cinemaDetails.getPhone());
            cinema.setCinemaType(cinemaDetails.getCinemaType());
            cinema.setUpdatedAt(new Date());
            return cinemaRepository.save(cinema);
        }).orElseThrow(() -> new ResourceNotFoundException("Cinema cannot be found with id :" + id));
    }
}

