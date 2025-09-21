-- Fix database schema for bookings table
-- The status column is too short to store enum values like 'PAID'

-- Check current schema
DESCRIBE bookings;

-- Fix the status column to be longer
ALTER TABLE bookings MODIFY COLUMN status VARCHAR(20);

-- Verify the change
DESCRIBE bookings;

-- Test with a sample update
UPDATE bookings SET status = 'PAID' WHERE id = 1;

-- Check if the update worked
SELECT id, status FROM bookings WHERE id = 1;
