-- Script to check and update email verification status

-- 1. Check current email verification status of all users
SELECT 
    id, 
    username, 
    email, 
    is_email_verified,
    created_at,
    CASE 
        WHEN is_email_verified = 1 THEN 'VERIFIED'
        WHEN is_email_verified = 0 THEN 'UNVERIFIED'
        WHEN is_email_verified IS NULL THEN 'NULL'
        ELSE 'UNKNOWN'
    END as verification_status
FROM users 
ORDER BY created_at DESC;

-- 2. Count verification status
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN is_email_verified = 1 THEN 1 ELSE 0 END) as verified_users,
    SUM(CASE WHEN is_email_verified = 0 THEN 1 ELSE 0 END) as unverified_users,
    SUM(CASE WHEN is_email_verified IS NULL THEN 1 ELSE 0 END) as null_users
FROM users;

-- 3. Set specific user as verified (replace 'testuser' with actual username)
-- UPDATE users 
-- SET is_email_verified = 1 
-- WHERE username = 'testuser';

-- 4. Set all existing users as verified (for testing purposes)
-- UPDATE users 
-- SET is_email_verified = 1 
-- WHERE is_email_verified IS NULL OR is_email_verified = 0;

-- 5. Set specific user as unverified (for testing)
-- UPDATE users 
-- SET is_email_verified = 0 
-- WHERE username = 'testuser';

-- 6. Verify the changes
SELECT 
    id, 
    username, 
    email, 
    is_email_verified,
    created_at
FROM users 
WHERE username = 'testuser';
