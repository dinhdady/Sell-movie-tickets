<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Home - Cinema</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/home.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
</head>
<body class="home">
<div class="home">
  <!-- Notifications -->
  <div class="notifications-container">
    <c:forEach var="notification" items="${notifications}">
      <div class="notification ${notification.type}">
        <span>${notification.message}</span>
        <button onclick="this.parentElement.style.display='none'">x</button>
      </div>
    </c:forEach>
  </div>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <h1>Trải nghiệm điện ảnh tuyệt vời</h1>
        <p>Khám phá những bộ phim mới nhất với công nghệ chiếu phim hiện đại và âm thanh sống động</p>
        <div class="hero-buttons">
          <a href="${pageContext.request.contextPath}/movies" class="btn-primary">Xem phim ngay</a>
          <form action="${pageContext.request.contextPath}/booking" method="get" style="display:inline;">
            <input type="hidden" name="movieId" value="${featuredMovies[0].id}" />
            <button type="submit" class="btn-secondary" ${bookingLoading ? "disabled" : ""}>
              <c:choose>
                <c:when test="${not bookingLoading}">Đặt vé</c:when>
                <c:otherwise>Đang tải...</c:otherwise>
              </c:choose>
            </button>
          </form>
        </div>
      </div>
      <div class="hero-image">
        <div class="movie-poster">
          <img src="https://placehold.co/300x450?text=Movie+Poster" alt="Featured Movie" />
          <div class="play-button">
            <i class="fas fa-play"></i>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Movies Section -->
  <section class="featured-movies">
    <div class="container">
      <div class="section-header">
        <h2>PHIM ĐỀ CỬ</h2>
        <a href="${pageContext.request.contextPath}/movies" class="view-all">Xem tất cả</a>
      </div>

      <div class="movies-grid">
        <c:forEach var="movie" items="${featuredMovies}">
          <div class="movie-card featured">
            <div class="movie-poster">
              <img src="${movie.posterUrl != null ? movie.posterUrl : 'https://placehold.co/250x375?text=Movie'}" alt="${movie.title}" />
              <div class="trending-badge">
                <span>Trending</span>
              </div>
              <div class="movie-status">
                <span>Hoàn Tất (${movie.episodes != null ? movie.episodes : 1}/${movie.episodes != null ? movie.episodes : 1}) Vietsub + Thuyết</span>
              </div>
              <div class="movie-overlay">
                <div class="movie-actions">
                  <a href="${pageContext.request.contextPath}/movies/${movie.id}" class="btn-detail">Chi tiết</a>
                  <form action="${pageContext.request.contextPath}/booking" method="get" style="display:inline;">
                    <input type="hidden" name="movieId" value="${movie.id}" />
                    <button type="submit" class="btn-book">Đặt vé</button>
                  </form>
                </div>
              </div>
            </div>
            <div class="movie-info">
              <h3 class="vietnamese-title">${movie.title}</h3>
              <h4 class="english-title">${movie.originalTitle != null ? movie.originalTitle : movie.title}</h4>
            </div>
          </div>
        </c:forEach>
      </div>
    </div>
  </section>

  <!-- Coming Soon Section -->
  <section class="coming-soon">
    <div class="container">
      <div class="section-header">
        <h2>Phim sắp chiếu</h2>
        <a href="${pageContext.request.contextPath}/movies?status=coming-soon" class="view-all">Xem tất cả</a>
      </div>

      <div class="movies-grid">
        <c:forEach var="movie" items="${comingSoonMovies}">
          <div class="movie-card coming-soon">
            <div class="movie-poster">
              <img src="${movie.posterUrl != null ? movie.posterUrl : 'https://placehold.co/250x375?text=Coming+Soon'}" alt="${movie.title}" />
              <div class="coming-soon-badge">
                <span>Sắp chiếu</span>
              </div>
              <div class="movie-overlay">
                <div class="movie-actions">
                  <a href="${pageContext.request.contextPath}/movies/${movie.id}" class="btn-detail">Chi tiết</a>
                </div>
              </div>
            </div>
            <div class="movie-info">
              <h3>${movie.title}</h3>
              <p class="movie-genre">${movie.genre}</p>
              <c:if test="${movie.status == 'COMING_SOON'}">
                <p class="release-date">Khởi chiếu: ${movie.releaseDate}</p>
              </c:if>
            </div>
          </div>
        </c:forEach>
      </div>
    </div>
  </section>

  <!-- Movies by Category Section -->
  <c:if test="${not loading and not empty genres}">
  <section class="movies-by-category">
    <div class="container">
      <div class="section-header">
        <h2>Phim theo thể loại</h2>
        <p>Khám phá phim theo sở thích của bạn</p>
      </div>

      <div class="category-sections">
        <c:forEach var="genre" items="${genres}">
          <div class="category-section">
            <div class="category-header">
              <div class="category-info">
                <i class="${genreIcons[genre] != null ? genreIcons[genre] : 'fas fa-film'}"></i>
                <h3>${genre}</h3>
                <span class="movie-count">${fn:length(moviesByCategory[genre])} phim</span>
              </div>
              <a href="${pageContext.request.contextPath}/movies?genre=${genre}" class="view-all">Xem tất cả</a>
            </div>

            <div class="movies-grid">
              <c:forEach var="movie" items="${moviesByCategory[genre]}" varStatus="status" begin="0" end="3">
                <div class="movie-card">
                  <div class="movie-poster">
                    <img src="${movie.posterUrl != null ? movie.posterUrl : 'https://placehold.co/250x375?text=Movie'}" alt="${movie.title}" />
                    <div class="movie-overlay">
                      <div class="movie-actions">
                        <a href="${pageContext.request.contextPath}/movies/${movie.id}" class="btn-detail">Chi tiết</a>
                        <c:if test="${movie.status == 'NOW_SHOWING'}">
                          <form action="${pageContext.request.contextPath}/booking" method="get" style="display:inline;">
                            <input type="hidden" name="movieId" value="${movie.id}" />
                            <button type="submit" class="btn-book">Đặt vé</button>
                          </form>
                        </c:if>
                      </div>
                    </div>
                    <c:if test="${movie.rating > 0}">
                      <div class="movie-rating">
                        <span class="rating">${movie.rating}/10</span>
                      </div>
                    </c:if>
                    <c:if test="${movie.status == 'COMING_SOON'}">
                      <div class="coming-soon-badge">
                        <span>Sắp chiếu</span>
                      </div>
                    </c:if>
                  </div>
                  <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p class="movie-genre">${movie.genre}</p>
                    <c:if test="${movie.duration != null}">
                      <p class="movie-duration">${movie.duration} phút</p>
                    </c:if>
                    <c:if test="${movie.status == 'COMING_SOON'}">
                      <p class="release-date">Khởi chiếu: ${movie.releaseDate}</p>
                    </c:if>
                    <c:if test="${movie.status == 'NOW_SHOWING'}">
                      <div class="movie-price">
                        <span class="price">${movie.price}</span>
                      </div>
                    </c:if>
                  </div>
                </div>
              </c:forEach>
            </div>
          </div>
        </c:forEach>
      </div>
    </div>
  </section>
  </c:if>

  <!-- Loading Section -->
  <c:if test="${loading}">
  <section class="loading-section">
    <div class="container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Đang tải danh sách phim...</p>
      </div>
    </div>
  </section>
  </c:if>

  <!-- Error Section -->
  <c:if test="${not empty error}">
  <section class="error-section">
    <div class="container">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${error}</p>
        <form action="${pageContext.request.contextPath}/home" method="get">
          <button type="submit" class="btn-retry">Thử lại</button>
        </form>
      </div>
    </div>
  </section>
  </c:if>

  <!-- Empty State Section -->
  <c:if test="${not loading and empty featuredMovies and empty comingSoonMovies}">
  <section class="empty-state">
    <div class="container">
      <div class="empty-content">
        <i class="fas fa-film"></i>
        <h3>Chưa có phim nào</h3>
        <p>Hiện tại chưa có phim nào được thêm vào hệ thống.</p>
        <form action="${pageContext.request.contextPath}/home" method="get">
          <button type="submit" class="btn-refresh">
            <i class="fas fa-sync-alt"></i>
            Tải lại
          </button>
        </form>
      </div>
    </div>
  </section>
  </c:if>

  <!-- Features Section -->
  <section class="features">
    <div class="container">
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <h3>Đặt vé dễ dàng</h3>
          <p>Đặt vé online nhanh chóng, thanh toán an toàn với nhiều phương thức</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-film"></i>
          </div>
          <h3>Công nghệ hiện đại</h3>
          <p>Hệ thống chiếu phim 4K, âm thanh Dolby Atmos chất lượng cao</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-couch"></i>
          </div>
          <h3>Ghế ngồi thoải mái</h3>
          <p>Ghế ngồi cao cấp, có thể điều chỉnh và massage tự động</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-utensils"></i>
          </div>
          <h3>Dịch vụ ăn uống</h3>
          <p>Đặt đồ ăn và thức uống ngay tại chỗ, phục vụ tận nơi</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Section -->
  <section class="newsletter">
    <div class="container">
      <div class="newsletter-content">
        <h2>Đăng ký nhận thông báo</h2>
        <p>Nhận thông báo về phim mới, ưu đãi đặc biệt và sự kiện sắp diễn ra</p>
        <form action="${pageContext.request.contextPath}/newsletter/subscribe" method="post" class="newsletter-form">
          <input type="email" name="email" placeholder="Nhập email của bạn" class="email-input" required />
          <button type="submit" class="btn-subscribe">Đăng ký</button>
        </form>
      </div>
    </div>
  </section>
</div>
<script>
  // Add any necessary JavaScript here for interactivity if needed
</script>
</body>
</html>
