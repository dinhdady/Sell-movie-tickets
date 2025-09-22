-- Lấy token verification mới nhất
SELECT 
    e.id,
    e.token,
    e.user_id,
    u.email,
    u.username,
    e.expiry_date,
    e.created_at,
    e.is_used
FROM email_verification_tokens e
JOIN users u ON e.user_id = u.id
WHERE e.is_used = FALSE 
  AND e.expiry_date > NOW()
ORDER BY e.created_at DESC
LIMIT 1;
