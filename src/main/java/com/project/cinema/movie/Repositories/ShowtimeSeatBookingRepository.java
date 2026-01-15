package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.ShowtimeSeatBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeSeatBookingRepository extends JpaRepository<ShowtimeSeatBooking, Long> {
    
    List<ShowtimeSeatBooking> findByShowtimeId(Long showtimeId);
    
    List<ShowtimeSeatBooking> findBySeatId(Long seatId);
    
    ShowtimeSeatBooking findByShowtimeIdAndSeatId(Long showtimeId, Long seatId);
    
    boolean existsByShowtimeIdAndSeatId(Long showtimeId, Long seatId);
    
    @Query("SELECT ssb FROM ShowtimeSeatBooking ssb WHERE ssb.showtime.id = :showtimeId AND ssb.seat.room.id = :roomId")
    List<ShowtimeSeatBooking> findByShowtimeIdAndRoomId(@Param("showtimeId") Long showtimeId, @Param("roomId") Long roomId);
    
    List<ShowtimeSeatBooking> findByBookingId(Long bookingId);
    
    @Query("SELECT COUNT(ssb) > 0 FROM ShowtimeSeatBooking ssb WHERE ssb.showtime.id = :showtimeId AND ssb.seat.id = :seatId")
    boolean isSeatBookedForShowtime(@Param("showtimeId") Long showtimeId, @Param("seatId") Long seatId);
    
    // Delete all ShowtimeSeatBooking by showtime ID
    void deleteByShowtimeId(Long showtimeId);
}
