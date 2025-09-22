-- Fix Orphaned Bookings Script
-- This script will identify and fix orphaned booking records

-- 1. Check for orphaned bookings (bookings with showtime_id that doesn't exist)
SELECT 
    b.id as booking_id,
    b.showtime_id,
    b.customer_name,
    b.customer_email,
    b.total_price,
    b.created_at
FROM booking b
LEFT JOIN showtime s ON b.showtime_id = s.id
WHERE s.id IS NULL;

-- 2. Check for orphaned showtime_seat_booking records
SELECT 
    ssb.id,
    ssb.booking_id,
    ssb.showtime_id,
    ssb.seat_id
FROM showtime_seat_booking ssb
LEFT JOIN showtime s ON ssb.showtime_id = s.id
WHERE s.id IS NULL;

-- 3. Check for orphaned tickets
SELECT 
    t.id,
    t.order_id,
    t.seat_id
FROM ticket t
LEFT JOIN seat s ON t.seat_id = s.id
WHERE s.id IS NULL;

-- 4. Delete orphaned showtime_seat_booking records
DELETE FROM showtime_seat_booking 
WHERE showtime_id NOT IN (SELECT id FROM showtime);

-- 5. Delete orphaned tickets
DELETE FROM ticket 
WHERE seat_id NOT IN (SELECT id FROM seat);

-- 6. Update orphaned bookings to have NULL showtime_id (safer than deleting)
UPDATE booking 
SET showtime_id = NULL 
WHERE showtime_id NOT IN (SELECT id FROM showtime);

-- 7. Check remaining data integrity
SELECT 
    'bookings' as table_name,
    COUNT(*) as total_count,
    COUNT(showtime_id) as with_showtime,
    COUNT(*) - COUNT(showtime_id) as without_showtime
FROM booking
UNION ALL
SELECT 
    'showtime_seat_booking' as table_name,
    COUNT(*) as total_count,
    COUNT(showtime_id) as with_showtime,
    COUNT(*) - COUNT(showtime_id) as without_showtime
FROM showtime_seat_booking
UNION ALL
SELECT 
    'ticket' as table_name,
    COUNT(*) as total_count,
    COUNT(seat_id) as with_seat,
    COUNT(*) - COUNT(seat_id) as without_seat
FROM ticket;

