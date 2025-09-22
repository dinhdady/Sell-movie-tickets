package com.project.cinema.movie.Services;

import com.project.cinema.movie.Models.Room;
import com.project.cinema.movie.Models.Seat;
import com.project.cinema.movie.Models.SeatStatus;
import com.project.cinema.movie.Models.SeatType;
import com.project.cinema.movie.Models.ShowtimeSeatBooking;
import com.project.cinema.movie.Repositories.SeatRepository;
import com.project.cinema.movie.Repositories.ShowtimeSeatBookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Quản lý ghế trong phòng chiếu
 */
@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final RoomService roomService;
    private final ShowtimeSeatBookingRepository showtimeSeatBookingRepository;

    public SeatService(SeatRepository seatRepository, RoomService roomService, ShowtimeSeatBookingRepository showtimeSeatBookingRepository) {
        this.seatRepository = seatRepository;
        this.roomService = roomService;
        this.showtimeSeatBookingRepository = showtimeSeatBookingRepository;
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
     * Kiểm tra trạng thái ghế từ bảng showtime_seat_booking
     */
    public List<Seat> getSeatAvailability(Long showtimeId, Long roomId) {
        // Lấy tất cả ghế trong phòng
        List<Seat> seats = seatRepository.findByRoomId(roomId);
        
        // Lấy tất cả booking ghế cho suất chiếu này
        List<ShowtimeSeatBooking> seatBookings = showtimeSeatBookingRepository.findByShowtimeId(showtimeId);
        
        // Tạo map để tra cứu nhanh trạng thái ghế
        Map<Long, SeatStatus> seatStatusMap = seatBookings.stream()
            .collect(Collectors.toMap(
                booking -> booking.getSeat().getId(),
                ShowtimeSeatBooking::getStatus,
                (existing, replacement) -> existing // Nếu có duplicate, giữ giá trị cũ
            ));
        
        // Cập nhật trạng thái cho từng ghế
        seats.forEach(seat -> {
            SeatStatus status = seatStatusMap.get(seat.getId());
            if (status != null) {
                seat.setStatus(status.name());
            } else {
                seat.setStatus(SeatStatus.AVAILABLE.name());
            }
        });
        
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
                
                // Set price based on seat type
                switch (currentType) {
                    case VIP:
                        seat.setPrice(150000.0); // VIP seat price
                        break;
                    case COUPLE:
                        seat.setPrice(200000.0); // Couple seat price
                        break;
                    case REGULAR:
                    default:
                        seat.setPrice(100000.0); // Regular seat price
                        break;
                }
                
                seats.add(seat);
            }
        }
        return seats;
    }
}
