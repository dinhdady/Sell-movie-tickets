# 🎬 Cinema Booking System - Setup Guide

## 🚀 Quick Start

### 1. Backend Setup
```bash
# Install dependencies
mvn clean install

# Start backend
mvn spring-boot:run
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

### 3. Database Setup
- MySQL running on localhost:3306
- Database: `movietickets`
- Username: `root`
- Password: `123456789`

## 🔐 Environment Variables

### Frontend (.env.local)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/movietickets
spring.datasource.username=root
spring.datasource.password=123456789

# Email
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# Payment
momo.partner-code=your_momo_partner_code
momo.access-key=your_momo_access_key
momo.secret-key=your_momo_secret_key
```

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/google-auth-callback`
   - `http://localhost:5174/google-auth-callback`
6. Copy Client ID and Client Secret to `.env.local`

## 💳 Payment Setup

### MoMo Payment
1. Register at [MoMo Developer](https://developers.momo.vn/)
2. Get test credentials
3. Update `application.properties`

### VNPay Payment
1. Register at [VNPay](https://sandbox.vnpayment.vn/)
2. Get test credentials
3. Update `application.properties`

## 🎯 Features

- ✅ User Authentication (Google OAuth)
- ✅ Movie Booking System
- ✅ Payment Integration (MoMo, VNPay)
- ✅ Admin Panel
- ✅ Email Notifications
- ✅ Responsive Design

## 📱 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Admin Panel**: http://localhost:5173/admin

## 🛠️ Development

### Backend
- Spring Boot 3.x
- MySQL 8.0
- JWT Authentication
- Maven

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS

## 🔒 Security Notes

- Never commit `.env` files
- Use environment variables for secrets
- Keep credentials secure
- Use HTTPS in production

## 📞 Support

For issues or questions, please check the documentation or contact the development team.
