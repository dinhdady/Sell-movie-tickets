-- URGENT: Fix database schema for VNPay callback
-- This will fix the "Data truncated for column 'status'" error

-- Check current schema
DESCRIBE bookings;

-- Fix the status column to be longer (20 characters)
ALTER TABLE bookings MODIFY COLUMN status VARCHAR(20);

-- Verify the change
DESCRIBE bookings;

-- Test with a sample update
UPDATE bookings SET status = 'PAID' WHERE id = 1;

-- Check if the update worked
SELECT id, status FROM bookings WHERE id = 1;

-- Show all booking statuses
SELECT DISTINCT status FROM bookings;
