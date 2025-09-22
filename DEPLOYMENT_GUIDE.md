# 🚀 Hướng dẫn Deploy Cinema Movie Booking System

## 📋 Yêu cầu hệ thống

- **Java**: 17 hoặc cao hơn
- **Maven**: 3.6 hoặc cao hơn
- **Node.js**: 18 hoặc cao hơn
- **MySQL**: 8.0 hoặc cao hơn
- **Git**: Để clone repository

## 🔧 Cài đặt Dependencies

### 1. Cài đặt Java
```bash
# Windows (Chocolatey)
choco install openjdk17

# Windows (Manual)
# Download từ: https://adoptium.net/
# Cài đặt và thêm vào PATH

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install openjdk-17-jdk

# Mac
brew install openjdk@17
```

### 2. Cài đặt Maven
```bash
# Windows (Chocolatey)
choco install maven

# Windows (Manual)
# Download từ: https://maven.apache.org/download.cgi
# Giải nén và thêm vào PATH

# Linux (Ubuntu/Debian)
sudo apt install maven

# Mac
brew install maven
```

### 3. Cài đặt Node.js
```bash
# Windows (Chocolatey)
choco install nodejs

# Windows (Manual)
# Download từ: https://nodejs.org/

# Linux (Ubuntu/Debian)
sudo apt install nodejs npm

# Mac
brew install node
```

### 4. Cài đặt MySQL
```bash
# Windows (Chocolatey)
choco install mysql

# Linux (Ubuntu/Debian)
sudo apt install mysql-server

# Mac
brew install mysql
```

## 🚀 Cách chạy ứng dụng

### Phương pháp 1: Sử dụng Scripts (Khuyến nghị)

#### Chạy toàn bộ ứng dụng (Backend + Frontend)
```powershell
# Windows PowerShell
.\start-all.ps1

# Hoặc chạy từng phần
.\run-app.ps1          # Chỉ backend
.\run-frontend.ps1     # Chỉ frontend
```

#### Cài đặt Maven tự động
```powershell
.\install-maven.ps1
```

### Phương pháp 2: Chạy thủ công

#### Backend
```bash
# Build
mvn clean package -DskipTests

# Chạy
java -jar target/movie-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Cấu hình Database

### 1. Tạo Database
```sql
CREATE DATABASE movietickets;
```

### 2. Cấu hình kết nối
Chỉnh sửa file `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/movietickets?useUnicode=true&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Xử lý lỗi Foreign Key Constraint
Nếu gặp lỗi foreign key constraint khi xóa showtime:
```sql
-- Chạy script này để xóa dữ liệu an toàn
source fix-foreign-key-constraints.sql
```

## 🌐 Truy cập ứng dụng

- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:8080 (nếu build với frontend)
- **Frontend Dev**: http://localhost:5173 (nếu chạy riêng)

## 🔧 Cấu hình Production

### 1. Tạo file cấu hình production
Tạo file `src/main/resources/application-prod.properties`:
```properties
server.port=8080
spring.profiles.active=prod

# Database
spring.datasource.url=jdbc:mysql://your-db-host:3306/movietickets
spring.datasource.username=your-username
spring.datasource.password=your-password

# Logging
logging.level.org.springframework.security=WARN
logging.level.com.project.cinema.movie=INFO

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 2. Build cho production
```bash
# Build với profile production
mvn clean package -DskipTests -Pprod

# Chạy với profile production
java -jar target/movie-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 🐳 Deploy với Docker

### 1. Tạo Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy JAR file
COPY target/movie-0.0.1-SNAPSHOT.jar app.jar

# Copy frontend build
COPY frontend/dist/ /app/static/

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
```

### 2. Tạo docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/movietickets
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=123456789
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=123456789
      - MYSQL_DATABASE=movietickets
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### 3. Chạy với Docker
```bash
# Build và chạy
docker-compose up -d

# Hoặc build riêng
docker build -t cinema-movie-booking .
docker run -p 8080:8080 cinema-movie-booking
```

## ☁️ Deploy lên Cloud

### 1. Heroku
```bash
# Tạo Procfile
echo "web: java -jar target/movie-0.0.1-SNAPSHOT.jar" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 2. Railway
```bash
# Tạo railway.json
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "java -jar target/movie-0.0.1-SNAPSHOT.jar",
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Deploy
railway login
railway init
railway up
```

### 3. Render
```bash
# Tạo render.yaml
cat > render.yaml << EOF
services:
  - type: web
    name: cinema-movie-booking
    env: java
    buildCommand: mvn clean package -DskipTests
    startCommand: java -jar target/movie-0.0.1-SNAPSHOT.jar
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: production
EOF
```

## 🔍 Troubleshooting

### Lỗi thường gặp

#### 1. Maven không tìm thấy
```bash
# Kiểm tra Maven
mvn -version

# Nếu không có, cài đặt lại
.\install-maven.ps1
```

#### 2. Java không tìm thấy
```bash
# Kiểm tra Java
java -version

# Nếu không có, cài đặt Java 17
```

#### 3. MySQL kết nối thất bại
```bash
# Kiểm tra MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE movietickets;
```

#### 4. Foreign Key Constraint Error
```sql
-- Chạy script để xóa dữ liệu an toàn
source fix-foreign-key-constraints.sql
```

#### 5. Port đã được sử dụng
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

## 📊 Monitoring

### Health Check
```bash
# Kiểm tra health
curl http://localhost:8080/actuator/health

# Kiểm tra metrics
curl http://localhost:8080/actuator/metrics
```

### Logs
```bash
# Xem logs
tail -f logs/application.log

# Hoặc trong console
java -jar target/movie-0.0.1-SNAPSHOT.jar --logging.level.com.project.cinema.movie=DEBUG
```

## 🔐 Security

### 1. Cấu hình HTTPS
```properties
# application.properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=your-password
server.ssl.key-store-type=PKCS12
```

### 2. Cấu hình CORS
```properties
# application.properties
spring.web.cors.allowed-origins=https://your-domain.com
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
```

## 📝 Notes

- Đảm bảo MySQL đang chạy trước khi start ứng dụng
- Kiểm tra port 8080 không bị sử dụng
- Cấu hình email trong `application.properties` để gửi email
- Cấu hình Cloudinary để upload ảnh
- Cấu hình VNPay để thanh toán

## 🆘 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs trong console
2. Logs trong file `logs/application.log`
3. Database connection
4. Port availability
5. Dependencies installation

---

**Chúc bạn deploy thành công! 🎉**
