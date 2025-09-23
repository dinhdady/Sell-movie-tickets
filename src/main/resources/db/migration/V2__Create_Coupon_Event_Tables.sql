-- Create coupon tables
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT DEFAULT -1,
    used_count INT DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create event tables
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT DEFAULT -1,
    used_count INT DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create event usage tracking table
CREATE TABLE IF NOT EXISTS event_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Add status column to showtimes table if not exists
ALTER TABLE showtimes ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';

-- Insert sample coupons
INSERT INTO coupons (code, name, description, type, value, min_order_amount, usage_limit, end_date) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 10.00, 100000, 100, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE50K', 'Tiết kiệm 50k', 'Giảm 50,000 VNĐ cho đơn hàng từ 200,000 VNĐ', 'FIXED_AMOUNT', 50000, 200000, 200, DATE_ADD(NOW(), INTERVAL 60 DAY)),
('VIP20', 'Khách hàng VIP', 'Giảm 20% cho khách hàng VIP', 'PERCENTAGE', 20.00, 300000, 50, DATE_ADD(NOW(), INTERVAL 90 DAY));

-- Insert sample events
INSERT INTO events (name, description, type, value, min_order_amount, usage_limit, end_date) VALUES
('Tết Nguyên Đán 2025', 'Giảm giá đặc biệt dịp Tết', 'PERCENTAGE', 20.00, 150000, 500, DATE_ADD(NOW(), INTERVAL 15 DAY)),
('Khuyến mãi cuối năm', 'Giảm giá cuối năm', 'FIXED_AMOUNT', 100000, 500000, 100, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Ngày lễ tình nhân', 'Giảm giá cho cặp đôi', 'PERCENTAGE', 15.00, 200000, 300, DATE_ADD(NOW(), INTERVAL 45 DAY));
