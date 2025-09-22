INSERT INTO users (id, username, email, password, full_name, phone, role, is_active, is_email_verified, created_at, updated_at) 
VALUES (
    'admin123',
    'admin',
    'admin@example.com',
    '.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Admin User',
    '0123456789',
    'ADMIN',
    true,
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    password = VALUES(password),
    full_name = VALUES(full_name),
    phone = VALUES(phone),
    role = VALUES(role),
    is_active = VALUES(is_active),
    is_email_verified = VALUES(is_email_verified),
    updated_at = NOW();
