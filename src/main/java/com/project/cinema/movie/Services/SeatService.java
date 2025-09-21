package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Room;
import com.project.cinema.movie.Models.Seat;
import com.project.cinema.movie.Models.SeatType;
import com.project.cinema.movie.Repositories.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatService {
    
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private RoomService roomService;

    /**
     * Tự động tạo ghế cho phòng chiếu theo pattern A1, A2, B1, B2...
     * @param roomId ID của phòng chiếu
     * @param rows Số hàng ghế (mặc định 8)
     * @param seatsPerRow Số ghế mỗi hàng (mặc định 10)
     * @param seatType Loại ghế (mặc định REGULAR)
     * @return Danh sách ghế đã tạo
     */
    @Transactional
    public List<Seat> generateSeatsForRoom(Long roomId, int rows, int seatsPerRow, SeatType seatType) {
        Room room = roomService.getRoomById(roomId);
        if (room == null) {
            throw new RuntimeException("Room not found with id: " + roomId);
        }

        // Xóa tất cả ghế cũ của phòng này
        seatRepository.deleteByRoomId(roomId);

        List<Seat> seats = new ArrayList<>();
        
        // Tạo ghế theo pattern A1, A2, B1, B2...
        for (int row = 0; row < rows; row++) {
            char rowLetter = (char) ('A' + row);
            
            for (int col = 1; col <= seatsPerRow; col++) {
                String seatNumber = rowLetter + String.valueOf(col);
                String rowNumber = String.valueOf(rowLetter);
                
                Seat seat = new Seat();
                seat.setSeatNumber(seatNumber);
                seat.setRowNumber(rowNumber);
                seat.setColumnNumber(col);
                seat.setSeatType(seatType != null ? seatType : SeatType.REGULAR);
                seat.setRoom(room);
                
                seats.add(seat);
            }
        }
        
        // Lưu tất cả ghế vào database
        List<Seat> savedSeats = seatRepository.saveAll(seats);
        
        // Cập nhật capacity của phòng
        room.setCapacity(savedSeats.size());
        roomService.updateRoom(roomId, room);
        
        return savedSeats;
    }

    /**
     * Tạo ghế với cấu hình mặc định (8 hàng x 10 ghế)
     */
    @Transactional
    public List<Seat> generateDefaultSeatsForRoom(Long roomId) {
        return generateSeatsForRoom(roomId, 8, 10, SeatType.REGULAR);
    }

    /**
     * Lấy tất cả ghế của một phòng
     */
    public List<Seat> getSeatsByRoomId(Long roomId) {
        return seatRepository.findByRoomId(roomId);
    }

    /**
     * Lấy ghế theo ID
     */
    public Seat getSeatById(Long seatId) {
        return seatRepository.findById(seatId).orElse(null);
    }

    /**
     * Xóa tất cả ghế của một phòng
     */
    @Transactional
    public void deleteSeatsByRoomId(Long roomId) {
        seatRepository.deleteByRoomId(roomId);
    }

    /**
     * Lấy trạng thái ghế cho một suất chiếu cụ thể
     * Hiện tại chỉ trả về tất cả ghế của phòng với trạng thái AVAILABLE
     * TODO: Implement logic kiểm tra ghế đã được đặt cho suất chiếu này
     */
    public List<Seat> getSeatAvailability(Long showtimeId, Long roomId) {
        // Lấy tất cả ghế của phòng
        List<Seat> seats = seatRepository.findByRoomId(roomId);
        
        // Hiện tại đánh dấu tất cả ghế là AVAILABLE
        // TODO: Kiểm tra booking để xác định ghế nào đã được đặt
        for (Seat seat : seats) {
            seat.setStatus("AVAILABLE");
        }
        
        return seats;
    }

    /**
     * Tạo ghế với cấu hình tùy chỉnh cho VIP hoặc ghế đôi
     */
    @Transactional
    public List<Seat> generateCustomSeatsForRoom(Long roomId, int rows, int seatsPerRow, 
                                                SeatType seatType, int vipRows, int coupleSeats) {
        Room room = roomService.getRoomById(roomId);
        if (room == null) {
            throw new RuntimeException("Room not found with id: " + roomId);
        }

        // Xóa ghế cũ
        seatRepository.deleteByRoomId(roomId);

        List<Seat> seats = new ArrayList<>();
        
        for (int row = 0; row < rows; row++) {
            char rowLetter = (char) ('A' + row);
            SeatType currentSeatType = SeatType.REGULAR;
            
            // Xác định loại ghế cho hàng này
            if (row < vipRows) {
                currentSeatType = SeatType.VIP;
            } else if (row >= rows - coupleSeats) {
                currentSeatType = SeatType.COUPLE;
            }
            
            for (int col = 1; col <= seatsPerRow; col++) {
                String seatNumber = rowLetter + String.valueOf(col);
                String rowNumber = String.valueOf(rowLetter);
                
                Seat seat = new Seat();
                seat.setSeatNumber(seatNumber);
                seat.setRowNumber(rowNumber);
                seat.setColumnNumber(col);
                seat.setSeatType(currentSeatType);
                seat.setRoom(room);
                
                seats.add(seat);
            }
        }
        
        List<Seat> savedSeats = seatRepository.saveAll(seats);
        
        // Cập nhật capacity
        room.setCapacity(savedSeats.size());
        roomService.updateRoom(roomId, room);
        
        return savedSeats;
    }
}