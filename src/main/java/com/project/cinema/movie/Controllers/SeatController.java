package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.Seat;
import com.project.cinema.movie.Models.SeatType;
import com.project.cinema.movie.Services.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seat")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class SeatController {
    
    @Autowired
    private SeatService seatService;

    /**
     * Tự động tạo ghế cho phòng chiếu
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate/{roomId}")
    public ResponseEntity<ResponseObject> generateSeatsForRoom(
            @PathVariable Long roomId,
            @RequestBody(required = false) Map<String, Object> config) {
        try {
            int rows = config != null && config.containsKey("rows") ? 
                      (Integer) config.get("rows") : 8;
            int seatsPerRow = config != null && config.containsKey("seatsPerRow") ? 
                             (Integer) config.get("seatsPerRow") : 10;
            String seatTypeStr = config != null && config.containsKey("seatType") ? 
                                (String) config.get("seatType") : "REGULAR";
            
            SeatType seatType = SeatType.valueOf(seatTypeStr.toUpperCase());
            
            List<Seat> seats = seatService.generateSeatsForRoom(roomId, rows, seatsPerRow, seatType);
            
            return ResponseEntity.ok(new ResponseObject("200", 
                "Seats generated successfully! Created " + seats.size() + " seats.", seats));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error generating seats: " + e.getMessage(), null));
        }
    }

    /**
     * Tạo ghế với cấu hình mặc định
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate-default/{roomId}")
    public ResponseEntity<ResponseObject> generateDefaultSeatsForRoom(@PathVariable Long roomId) {
        try {
            List<Seat> seats = seatService.generateDefaultSeatsForRoom(roomId);
            
            return ResponseEntity.ok(new ResponseObject("200", 
                "Default seats generated successfully! Created " + seats.size() + " seats.", seats));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error generating default seats: " + e.getMessage(), null));
        }
    }

    /**
     * Tạo ghế với cấu hình tùy chỉnh (VIP, ghế đôi)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate-custom/{roomId}")
    public ResponseEntity<ResponseObject> generateCustomSeatsForRoom(
            @PathVariable Long roomId,
            @RequestBody Map<String, Object> config) {
        try {
            int rows = (Integer) config.get("rows");
            int seatsPerRow = (Integer) config.get("seatsPerRow");
            int vipRows = config.containsKey("vipRows") ? (Integer) config.get("vipRows") : 0;
            int coupleSeats = config.containsKey("coupleSeats") ? (Integer) config.get("coupleSeats") : 0;
            String seatTypeStr = config.containsKey("seatType") ? 
                                (String) config.get("seatType") : "REGULAR";
            
            SeatType seatType = SeatType.valueOf(seatTypeStr.toUpperCase());
            
            List<Seat> seats = seatService.generateCustomSeatsForRoom(roomId, rows, seatsPerRow, 
                                                                     seatType, vipRows, coupleSeats);
            
            return ResponseEntity.ok(new ResponseObject("200", 
                "Custom seats generated successfully! Created " + seats.size() + " seats.", seats));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error generating custom seats: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy tất cả ghế của một phòng
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ResponseObject> getSeatsByRoomId(@PathVariable Long roomId) {
        try {
            List<Seat> seats = seatService.getSeatsByRoomId(roomId);
            
            return ResponseEntity.ok(new ResponseObject("200", 
                "Seats retrieved successfully!", seats));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving seats: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy ghế theo ID
     */
    @GetMapping("/{seatId}")
    public ResponseEntity<ResponseObject> getSeatById(@PathVariable Long seatId) {
        try {
            Seat seat = seatService.getSeatById(seatId);
            
            if (seat != null) {
                return ResponseEntity.ok(new ResponseObject("200", 
                    "Seat retrieved successfully!", seat));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("404", "Seat not found!", null));
            }
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving seat: " + e.getMessage(), null));
        }
    }

    /**
     * Xóa tất cả ghế của một phòng
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<ResponseObject> deleteSeatsByRoomId(@PathVariable Long roomId) {
        try {
            seatService.deleteSeatsByRoomId(roomId);
            
            return ResponseEntity.ok(new ResponseObject("200", 
                "All seats for room deleted successfully!", null));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error deleting seats: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy trạng thái ghế cho một suất chiếu cụ thể
     */
    @GetMapping("/availability")
    public ResponseEntity<ResponseObject> getSeatAvailability(
            @RequestParam Long showtimeId,
            @RequestParam Long roomId) {
        try {
            List<Seat> seats = seatService.getSeatAvailability(showtimeId, roomId);
            
            return ResponseEntity.ok(new ResponseObject("200", 
                "Seat availability retrieved successfully!", seats));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving seat availability: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy thông tin cấu hình ghế của một phòng
     */
    @GetMapping("/room/{roomId}/info")
    public ResponseEntity<ResponseObject> getSeatInfoByRoomId(@PathVariable Long roomId) {
        try {
            List<Seat> seats = seatService.getSeatsByRoomId(roomId);
            
            if (seats.isEmpty()) {
                return ResponseEntity.ok(new ResponseObject("200", 
                    "No seats found for this room.", Map.of(
                        "totalSeats", 0,
                        "rows", 0,
                        "seatsPerRow", 0,
                        "seatTypes", Map.of()
                    )));
            }
            
            // Phân tích cấu trúc ghế
            long totalSeats = seats.size();
            int maxRow = seats.stream()
                .mapToInt(s -> s.getRowNumber().charAt(0) - 'A')
                .max().orElse(0) + 1;
            int maxCol = seats.stream()
                .mapToInt(Seat::getColumnNumber)
                .max().orElse(0);
            
            // Đếm theo loại ghế
            Map<String, Long> seatTypeCount = seats.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    s -> s.getSeatType().name(),
                    java.util.stream.Collectors.counting()
                ));
            
            Map<String, Object> info = Map.of(
                "totalSeats", totalSeats,
                "rows", maxRow,
                "seatsPerRow", maxCol,
                "seatTypes", seatTypeCount
            );
            
            return ResponseEntity.ok(new ResponseObject("200", 
                "Seat information retrieved successfully!", info));
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving seat info: " + e.getMessage(), null));
        }
    }
}