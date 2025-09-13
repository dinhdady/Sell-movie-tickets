-- Drop foreign key constraint from Seats table
ALTER TABLE Seats DROP FOREIGN KEY IF EXISTS FK_Seats_Booking;

-- Remove bookingId column from Seats table
ALTER TABLE Seats DROP COLUMN IF EXISTS bookingId;

-- Create showtime_seat_bookings table
CREATE TABLE IF NOT EXISTS showtime_seat_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    showtime_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    booking_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (showtime_id) REFERENCES Showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES Seats(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE SET NULL,
    UNIQUE KEY unique_showtime_seat (showtime_id, seat_id)
);

-- Update all existing seats to AVAILABLE status
UPDATE Seats SET status = 'AVAILABLE' WHERE status IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX idx_showtime_seat_booking_showtime ON showtime_seat_bookings(showtime_id);
CREATE INDEX idx_showtime_seat_booking_seat ON showtime_seat_bookings(seat_id);
CREATE INDEX idx_showtime_seat_booking_booking ON showtime_seat_bookings(booking_id);

-- Migrate existing booking data to new system (if needed)
-- This would require custom logic based on your existing data structure
