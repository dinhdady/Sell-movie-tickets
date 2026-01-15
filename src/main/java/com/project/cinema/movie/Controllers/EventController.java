package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.DTO.EventDTO;
import com.project.cinema.movie.DTO.EventValidationDTO;
import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Services.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5177", "http://127.0.0.1:5177"}, allowCredentials = "true")
public class EventController {
    
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);
    
    @Autowired
    private EventService eventService;
    
    // Lấy tất cả event
    @GetMapping
    public ResponseEntity<ResponseObject> getAllEvents() {
        try {
            List<EventDTO> events = eventService.getAllEvents();
            return ResponseEntity.ok(new ResponseObject("200", "Events retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting all events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving events: " + e.getMessage(), null));
        }
    }
    
    // Lấy event theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getEventById(@PathVariable Long id) {
        try {
            return eventService.getEventById(id)
                .map(event -> ResponseEntity.ok(new ResponseObject("200", "Event retrieved successfully!", event)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseObject("404", "Event not found!", null)));
        } catch (Exception e) {
            logger.error("[EventController] Error getting event by ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving event: " + e.getMessage(), null));
        }
    }
    
    // Lấy event đang hoạt động
    @GetMapping("/active")
    public ResponseEntity<ResponseObject> getActiveEvents() {
        try {
            List<EventDTO> events = eventService.getActiveEvents();
            return ResponseEntity.ok(new ResponseObject("200", "Active events retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting active events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving active events: " + e.getMessage(), null));
        }
    }
    
    // Lấy event hiện tại (đang diễn ra)
    @GetMapping("/current")
    public ResponseEntity<ResponseObject> getCurrentEvents() {
        try {
            List<EventDTO> events = eventService.getCurrentEvents();
            return ResponseEntity.ok(new ResponseObject("200", "Current events retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting current events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving current events: " + e.getMessage(), null));
        }
    }
    
    // Lấy event có thể áp dụng
    @GetMapping("/applicable")
    public ResponseEntity<ResponseObject> getApplicableEvents(@RequestParam Double orderAmount) {
        try {
            List<EventDTO> events = eventService.getApplicableEvents(orderAmount);
            return ResponseEntity.ok(new ResponseObject("200", "Applicable events retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting applicable events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving applicable events: " + e.getMessage(), null));
        }
    }
    
    // Lấy event theo type
    @GetMapping("/type/{type}")
    public ResponseEntity<ResponseObject> getEventsByType(@PathVariable String type) {
        try {
            List<EventDTO> events = eventService.getEventsByType(com.project.cinema.movie.Models.EventType.valueOf(type.toUpperCase()));
            return ResponseEntity.ok(new ResponseObject("200", "Events by type retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting events by type {}: {}", type, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error retrieving events by type: " + e.getMessage(), null));
        }
    }
    
    // Validate event
    @PostMapping("/validate")
    public ResponseEntity<ResponseObject> validateEvent(@RequestBody EventValidationRequest request) {
        try {
            logger.info("[EventController] Validating event: {} for order amount: {} by user: {}", 
                request.getEventId(), request.getOrderAmount(), request.getUserId());
            
            EventValidationDTO validation = eventService.validateEvent(
                request.getEventId(), 
                request.getOrderAmount(), 
                request.getUserId()
            );
            
            return ResponseEntity.ok(new ResponseObject("200", "Event validation completed!", validation));
        } catch (Exception e) {
            logger.error("[EventController] Error validating event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Event validation failed: " + e.getMessage(), null));
        }
    }
    
    // Tạo event mới (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ResponseObject> createEvent(@RequestBody EventDTO eventDTO) {
        try {
            logger.info("[EventController] Creating new event: {}", eventDTO.getName());
            
            var event = eventService.createEvent(eventDTO);
            EventDTO createdEvent = new EventDTO(event);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseObject("201", "Event created successfully!", createdEvent));
        } catch (Exception e) {
            logger.error("[EventController] Error creating event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error creating event: " + e.getMessage(), null));
        }
    }
    
    // Cập nhật event (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateEvent(@PathVariable Long id, @RequestBody EventDTO eventDTO) {
        try {
            logger.info("[EventController] Updating event: {}", id);
            
            var event = eventService.updateEvent(id, eventDTO);
            EventDTO updatedEvent = new EventDTO(event);
            
            return ResponseEntity.ok(new ResponseObject("200", "Event updated successfully!", updatedEvent));
        } catch (Exception e) {
            logger.error("[EventController] Error updating event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error updating event: " + e.getMessage(), null));
        }
    }
    
    // Xóa event (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseObject> deleteEvent(@PathVariable Long id) {
        try {
            logger.info("[EventController] Deleting event: {}", id);
            
            eventService.deleteEvent(id);
            
            return ResponseEntity.ok(new ResponseObject("200", "Event deleted successfully!", null));
        } catch (Exception e) {
            logger.error("[EventController] Error deleting event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error deleting event: " + e.getMessage(), null));
        }
    }
    
    // Lấy thống kê event (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/stats")
    public ResponseEntity<ResponseObject> getEventStats(@PathVariable Long id) {
        try {
            var stats = eventService.getEventStats(id);
            return ResponseEntity.ok(new ResponseObject("200", "Event stats retrieved successfully!", stats));
        } catch (Exception e) {
            logger.error("[EventController] Error getting event stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ResponseObject("400", "Error getting event stats: " + e.getMessage(), null));
        }
    }
    
    // Lấy event sắp bắt đầu (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/upcoming")
    public ResponseEntity<ResponseObject> getUpcomingEvents() {
        try {
            List<EventDTO> events = eventService.getUpcomingEvents();
            return ResponseEntity.ok(new ResponseObject("200", "Upcoming events retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting upcoming events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving upcoming events: " + e.getMessage(), null));
        }
    }
    
    // Lấy event sắp kết thúc (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/ending-soon")
    public ResponseEntity<ResponseObject> getEndingSoonEvents() {
        try {
            List<EventDTO> events = eventService.getEndingSoonEvents();
            return ResponseEntity.ok(new ResponseObject("200", "Ending soon events retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting ending soon events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving ending soon events: " + e.getMessage(), null));
        }
    }
    
    // Lấy event đã hết hạn (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/expired")
    public ResponseEntity<ResponseObject> getExpiredEvents() {
        try {
            List<EventDTO> events = eventService.getExpiredEvents();
            return ResponseEntity.ok(new ResponseObject("200", "Expired events retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error getting expired events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error retrieving expired events: " + e.getMessage(), null));
        }
    }
    
    // Tìm kiếm event
    @GetMapping("/search")
    public ResponseEntity<ResponseObject> searchEvents(@RequestParam String keyword) {
        try {
            List<EventDTO> events = eventService.searchEvents(keyword);
            return ResponseEntity.ok(new ResponseObject("200", "Search results retrieved successfully!", events));
        } catch (Exception e) {
            logger.error("[EventController] Error searching events: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error searching events: " + e.getMessage(), null));
        }
    }
    
    // Cập nhật status của event (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-statuses")
    public ResponseEntity<ResponseObject> updateEventStatuses() {
        try {
            logger.info("[EventController] Updating event statuses");
            
            eventService.updateEventStatuses();
            
            return ResponseEntity.ok(new ResponseObject("200", "Event statuses updated successfully!", null));
        } catch (Exception e) {
            logger.error("[EventController] Error updating event statuses: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject("500", "Error updating event statuses: " + e.getMessage(), null));
        }
    }
    
    // Inner class cho request
    public static class EventValidationRequest {
        private Long eventId;
        private Double orderAmount;
        private Long userId;
        
        // Constructors
        public EventValidationRequest() {}
        
        public EventValidationRequest(Long eventId, Double orderAmount, Long userId) {
            this.eventId = eventId;
            this.orderAmount = orderAmount;
            this.userId = userId;
        }
        
        // Getters and Setters
        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }
        
        public Double getOrderAmount() { return orderAmount; }
        public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }
}
