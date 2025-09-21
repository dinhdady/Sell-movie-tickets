package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Room;
import com.project.cinema.movie.Models.Seat;
import com.project.cinema.movie.Models.SeatType;
import com.project.cinema.movie.Repositories.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Quản lý ghế trong phòng chiếu
 */
@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final RoomService roomService;

    public SeatService(SeatRepository seatRepository, RoomService roomService) {
        this.seatRepository = seatRepository;
        this.roomService = roomService;
    }

    /**
     * Tạo ghế theo cấu hình đơn giản (pattern A1, A2, ...)
     */
    @Transactional
    public List<Seat> generateSeatsForRoom(Long roomId, int rows, int seatsPerRow, SeatType seatType) {
        Room room = getValidRoom(roomId);

        seatRepository.deleteByRoomId(roomId);

        List<Seat> seats = buildSeats(room, rows, seatsPerRow,
                (rowIndex) -> seatType != null ? seatType : SeatType.REGULAR);

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        updateRoomCapacity(room, savedSeats.size());
        return savedSeats;
    }

    /**
     * Tạo ghế mặc định: 8 hàng x 10 ghế REGULAR
     */
    @Transactional
    public List<Seat> generateDefaultSeatsForRoom(Long roomId) {
        return generateSeatsForRoom(roomId, 8, 10, SeatType.REGULAR);
    }

    /**
     * Lấy tất cả ghế của phòng
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
     * Xoá toàn bộ ghế trong phòng
     */
    @Transactional
    public void deleteSeatsByRoomId(Long roomId) {
        seatRepository.deleteByRoomId(roomId);
    }

    /**
     * Lấy trạng thái ghế cho 1 suất chiếu.
     * Hiện tại trả về toàn bộ ghế với status "AVAILABLE".
     * TODO: Bổ sung logic check ghế đã được đặt
     */
    public List<Seat> getSeatAvailability(Long showtimeId, Long roomId) {
        List<Seat> seats = seatRepository.findByRoomId(roomId);
        seats.forEach(seat -> seat.setStatus("AVAILABLE"));
        return seats;
    }

    /**
     * Tạo ghế với cấu hình tuỳ chỉnh: VIP và Couple
     */
    @Transactional
    public List<Seat> generateCustomSeatsForRoom(Long roomId,
                                                 int rows,
                                                 int seatsPerRow,
                                                 SeatType defaultType,
                                                 int vipRows,
                                                 int coupleRows) {
        Room room = getValidRoom(roomId);

        seatRepository.deleteByRoomId(roomId);

        List<Seat> seats = buildSeats(room, rows, seatsPerRow, (rowIndex) -> {
            if (rowIndex < vipRows) return SeatType.VIP;
            if (rowIndex >= rows - coupleRows) return SeatType.COUPLE;
            return defaultType != null ? defaultType : SeatType.REGULAR;
        });

        List<Seat> savedSeats = seatRepository.saveAll(seats);
        updateRoomCapacity(room, savedSeats.size());
        return savedSeats;
    }

    // -------------------- PRIVATE UTILS --------------------

    /**
     * Tìm phòng và validate, nếu không có thì báo lỗi
     */
    private Room getValidRoom(Long roomId) {
        Room room = roomService.getRoomById(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found with id: " + roomId);
        }
        return room;
    }

    /**
     * Cập nhật capacity cho phòng
     */
    private void updateRoomCapacity(Room room, int seatCount) {
        room.setCapacity(seatCount);
        roomService.updateRoom(room.getId(), room);
    }

    /**
     * Sinh danh sách ghế theo pattern A1, A2,... và typeProvider cung cấp loại ghế
     */
    private List<Seat> buildSeats(Room room,
                                  int rows,
                                  int seatsPerRow,
                                  java.util.function.IntFunction<SeatType> typeProvider) {
        List<Seat> seats = new ArrayList<>();

        for (int row = 0; row < rows; row++) {
            char rowLetter = (char) ('A' + row);
            SeatType currentType = typeProvider.apply(row);

            for (int col = 1; col <= seatsPerRow; col++) {
                Seat seat = new Seat();
                seat.setSeatNumber(rowLetter + String.valueOf(col));
                seat.setRowNumber(String.valueOf(rowLetter));
                seat.setColumnNumber(col);
                seat.setSeatType(currentType);
                seat.setRoom(room);
                seats.add(seat);
            }
        }
        return seats;
    }
}
