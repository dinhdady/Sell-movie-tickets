package com.project.cinema.movie.Services;

import com.project.cinema.movie.DTO.EventDTO;
import com.project.cinema.movie.DTO.EventValidationDTO;
import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.EventRepository;
import com.project.cinema.movie.Repositories.EventUsageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventService {
    
    private static final Logger logger = LoggerFactory.getLogger(EventService.class);
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private EventUsageRepository eventUsageRepository;
    
    // Tạo event mới
    @Transactional
    public Event createEvent(EventDTO eventDTO) {
        logger.info("[EventService] Creating new event: {}", eventDTO.getName());
        
        Event event = new Event(
            eventDTO.getName(),
            eventDTO.getDescription(),
            eventDTO.getType(),
            eventDTO.getDiscountPercentage(),
            eventDTO.getMinimumOrderAmount(),
            eventDTO.getMaximumDiscountAmount(),
            eventDTO.getStartDate(),
            eventDTO.getEndDate()
        );
        
        if (eventDTO.getBannerUrl() != null) {
            event.setBannerUrl(eventDTO.getBannerUrl());
        }
        if (eventDTO.getImageUrl() != null) {
            event.setImageUrl(eventDTO.getImageUrl());
        }
        
        Event savedEvent = eventRepository.save(event);
        logger.info("[EventService] Created event successfully: {}", savedEvent.getId());
        
        return savedEvent;
    }
    
    // Lấy tất cả event
    public List<EventDTO> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy event theo ID
    public Optional<EventDTO> getEventById(Long id) {
        return eventRepository.findById(id)
                .map(EventDTO::new);
    }
    
    // Lấy tất cả event đang hoạt động
    public List<EventDTO> getActiveEvents() {
        List<Event> events = eventRepository.findActiveEvents(EventStatus.ACTIVE, LocalDateTime.now());
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy event hiện tại (đang diễn ra)
    public List<EventDTO> getCurrentEvents() {
        List<Event> events = eventRepository.findCurrentEvents(EventStatus.ACTIVE, LocalDateTime.now());
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy event có thể áp dụng cho order amount
    public List<EventDTO> getApplicableEvents(Double orderAmount) {
        List<Event> events = eventRepository.findApplicableEvents(EventStatus.ACTIVE, LocalDateTime.now(), orderAmount);
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy event theo type
    public List<EventDTO> getEventsByType(EventType type) {
        List<Event> events = eventRepository.findByType(type);
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Validate event
    public EventValidationDTO validateEvent(Long eventId, Double orderAmount, Long userId) {
        logger.info("[EventService] Validating event: {} for order amount: {} by user: {}", eventId, orderAmount, userId);
        
        // Tìm event
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        
        if (eventOpt.isEmpty()) {
            return new EventValidationDTO(false, "Event không tồn tại");
        }
        
        Event event = eventOpt.get();
        
        // Kiểm tra event có hoạt động không
        if (!event.isActive()) {
            return new EventValidationDTO(false, "Event không còn hoạt động");
        }
        
        // Kiểm tra minimum order amount
        if (orderAmount < event.getMinimumOrderAmount()) {
            return new EventValidationDTO(false, 
                String.format("Đơn hàng phải tối thiểu %,.0f VNĐ để tham gia event này", event.getMinimumOrderAmount()));
        }
        
        // Tính discount amount
        Double discountAmount = event.calculateDiscount(orderAmount);
        Double finalAmount = orderAmount - discountAmount;
        
        logger.info("[EventService] Event validation successful: discount={}, final={}", discountAmount, finalAmount);
        
        return new EventValidationDTO(true, "Event hợp lệ", discountAmount, finalAmount, new EventDTO(event));
    }
    
    // Sử dụng event
    @Transactional
    public EventUsage useEvent(Long eventId, User user, Booking booking, Double originalAmount) {
        logger.info("[EventService] Using event: {} for booking: {} by user: {}", eventId, booking.getId(), user.getId());
        
        // Validate event
        EventValidationDTO validation = validateEvent(eventId, originalAmount, Long.parseLong(user.getId()));
        if (!validation.isValid()) {
            throw new RuntimeException(validation.getMessage());
        }
        
        Event event = eventRepository.findById(eventId).orElseThrow(
            () -> new RuntimeException("Event không tồn tại")
        );
        
        // Tạo event usage record
        EventUsage usage = new EventUsage(
            event,
            user,
            booking,
            originalAmount,
            validation.getDiscountAmount(),
            validation.getFinalAmount()
        );
        
        // Lưu usage record
        EventUsage savedUsage = eventUsageRepository.save(usage);
        
        logger.info("[EventService] Event used successfully: {}", savedUsage.getId());
        
        return savedUsage;
    }
    
    // Cập nhật event
    @Transactional
    public Event updateEvent(Long id, EventDTO eventDTO) {
        logger.info("[EventService] Updating event: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));
        
        // Cập nhật các trường
        event.setName(eventDTO.getName());
        event.setDescription(eventDTO.getDescription());
        event.setDiscountPercentage(eventDTO.getDiscountPercentage());
        event.setMinimumOrderAmount(eventDTO.getMinimumOrderAmount());
        event.setMaximumDiscountAmount(eventDTO.getMaximumDiscountAmount());
        event.setStartDate(eventDTO.getStartDate());
        event.setEndDate(eventDTO.getEndDate());
        event.setStatus(eventDTO.getStatus());
        event.setIsActive(eventDTO.getIsActive());
        event.setBannerUrl(eventDTO.getBannerUrl());
        event.setImageUrl(eventDTO.getImageUrl());
        
        Event updatedEvent = eventRepository.save(event);
        logger.info("[EventService] Updated event successfully: {}", updatedEvent.getId());
        
        return updatedEvent;
    }
    
    // Xóa event
    @Transactional
    public void deleteEvent(Long id) {
        logger.info("[EventService] Deleting event: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));
        
        // Kiểm tra có usage không
        long usageCount = eventUsageRepository.countUsageByEventId(id);
        if (usageCount > 0) {
            throw new RuntimeException("Không thể xóa event đã được sử dụng");
        }
        
        eventRepository.delete(event);
        logger.info("[EventService] Deleted event successfully: {}", id);
    }
    
    // Lấy thống kê event
    public EventStatsDTO getEventStats(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));
        
        long usageCount = eventUsageRepository.countUsageByEventId(eventId);
        
        return new EventStatsDTO(
            event.getId(),
            event.getName(),
            event.getType(),
            event.getDiscountPercentage(),
            (int) usageCount,
            event.getStatus()
        );
    }
    
    // Lấy event sắp bắt đầu
    public List<EventDTO> getUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        
        List<Event> events = eventRepository.findUpcomingEvents(EventStatus.ACTIVE, now, sevenDaysLater);
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy event sắp kết thúc
    public List<EventDTO> getEndingSoonEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        
        List<Event> events = eventRepository.findEndingSoonEvents(EventStatus.ACTIVE, now, sevenDaysLater);
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Lấy event đã hết hạn
    public List<EventDTO> getExpiredEvents() {
        List<Event> events = eventRepository.findExpiredEvents(LocalDateTime.now(), EventStatus.ACTIVE);
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Tìm kiếm event
    public List<EventDTO> searchEvents(String keyword) {
        List<Event> events = eventRepository.findByNameContaining(keyword);
        return events.stream()
                .map(EventDTO::new)
                .collect(Collectors.toList());
    }
    
    // Tự động cập nhật status của event
    @Transactional
    public void updateEventStatuses() {
        logger.info("[EventService] Updating event statuses");
        
        LocalDateTime now = LocalDateTime.now();
        
        // Cập nhật event đã hết hạn
        List<Event> expiredEvents = eventRepository.findExpiredEvents(now, EventStatus.ACTIVE);
        for (Event event : expiredEvents) {
            event.setStatus(EventStatus.EXPIRED);
            eventRepository.save(event);
            logger.info("[EventService] Updated event {} to EXPIRED", event.getId());
        }
    }
    
    // Inner class cho stats
    public static class EventStatsDTO {
        private Long id;
        private String name;
        private EventType type;
        private Double discountPercentage;
        private Integer usageCount;
        private EventStatus status;
        
        public EventStatsDTO(Long id, String name, EventType type, Double discountPercentage, 
                           Integer usageCount, EventStatus status) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.discountPercentage = discountPercentage;
            this.usageCount = usageCount;
            this.status = status;
        }
        
        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public EventType getType() { return type; }
        public Double getDiscountPercentage() { return discountPercentage; }
        public Integer getUsageCount() { return usageCount; }
        public EventStatus getStatus() { return status; }
    }
}
