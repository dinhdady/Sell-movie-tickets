package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomId(Long roomId);
    boolean existsBySeatNumberAndRoomId(String seatNumber, Long roomId);
    
    // Lấy ghế theo số ghế và phòng
    @Query("SELECT s FROM Seat s WHERE s.seatNumber = :seatNumber AND s.room.id = :roomId")
    Seat findBySeatNumberAndRoom(@Param("seatNumber") String seatNumber, @Param("roomId") Long roomId);
    
    // Đếm số ghế theo phòng
    long countByRoomId(Long roomId);
}
