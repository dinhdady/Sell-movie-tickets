package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    
    /**
     * Tìm tất cả ghế của một phòng
     */
    List<Seat> findByRoomId(Long roomId);
    
    /**
     * Tìm ghế theo số ghế và phòng
     */
    Seat findBySeatNumberAndRoomId(String seatNumber, Long roomId);
    
    /**
     * Tìm ghế theo hàng và phòng
     */
    List<Seat> findByRowNumberAndRoomId(String rowNumber, Long roomId);
    
    /**
     * Xóa tất cả ghế của một phòng
     */
    void deleteByRoomId(Long roomId);
    
    /**
     * Đếm số ghế của một phòng
     */
    long countByRoomId(Long roomId);
    
    /**
     * Tìm ghế theo loại và phòng
     */
    List<Seat> findBySeatTypeAndRoomId(com.project.cinema.movie.Models.SeatType seatType, Long roomId);
    
    /**
     * Tìm ghế theo số ghế (không phân biệt phòng)
     */
    List<Seat> findBySeatNumber(String seatNumber);
    
    /**
     * Tìm ghế theo phòng và sắp xếp theo hàng và cột
     */
    @Query("SELECT s FROM Seat s WHERE s.room.id = :roomId ORDER BY s.rowNumber, s.columnNumber")
    List<Seat> findByRoomIdOrderByRowAndColumn(@Param("roomId") Long roomId);
    
    /**
     * Kiểm tra ghế có tồn tại theo số ghế và phòng
     */
    boolean existsBySeatNumberAndRoomId(String seatNumber, Long roomId);
}