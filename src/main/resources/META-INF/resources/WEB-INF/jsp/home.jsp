<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
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
    <div class="hero-background">
      <div class="hero-overlay"></div>
      <div class="hero-particles"></div>
    </div>
    <div class="hero-content">
      <div class="hero-text">
        <div class="hero-badge">
          <i class="fas fa-star"></i>
          <span>Trải nghiệm điện ảnh đỉnh cao</span>
        </div>
        <h1 class="hero-title">
          <span class="title-line">Trải nghiệm điện ảnh</span>
          <span class="title-highlight">tuyệt vời</span>
        </h1>
        <p class="hero-description">
          Khám phá những bộ phim mới nhất với công nghệ chiếu phim hiện đại, 
          âm thanh Dolby Atmos và màn hình 4K Ultra HD
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">Phim mới</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">50+</span>
            <span class="stat-label">Rạp chiếu</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">1M+</span>
            <span class="stat-label">Khách hàng</span>
          </div>
        </div>
        <div class="hero-buttons">
          <a href="${pageContext.request.contextPath}/movies" class="btn-primary">
            <i class="fas fa-play"></i>
            <span>Xem phim ngay</span>
          </a>
          <form action="${pageContext.request.contextPath}/booking" method="get" style="display:inline;">
            <input type="hidden" name="movieId" value="${featuredMovies[0].id}" />
            <button type="submit" class="btn-secondary" ${bookingLoading ? "disabled" : ""}>
              <i class="fas fa-ticket-alt"></i>
              <c:choose>
                <c:when test="${not bookingLoading}">Đặt vé</c:when>
                <c:otherwise>Đang tải...</c:otherwise>
              </c:choose>
            </button>
          </form>
        </div>
      </div>
      <div class="hero-image">
        <div class="movie-poster-container">
          <div class="movie-poster">
            <img src="https://placehold.co/400x600/1a1a2e/ffffff?text=Featured+Movie" alt="Featured Movie" />
            <div class="poster-overlay">
              <div class="play-button">
                <i class="fas fa-play"></i>
              </div>
              <div class="poster-badges">
                <span class="badge-new">Mới</span>
                <span class="badge-hd">4K UHD</span>
              </div>
            </div>
          </div>
          <div class="floating-cards">
            <div class="floating-card card-1">
              <i class="fas fa-star"></i>
              <span>9.2/10</span>
            </div>
            <div class="floating-card card-2">
              <i class="fas fa-users"></i>
              <span>1.2M lượt xem</span>
            </div>
            <div class="floating-card card-3">
              <i class="fas fa-calendar"></i>
              <span>2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Movies Section -->
  <section class="featured-movies">
    <div class="container">
      <div class="section-header">
        <div class="section-title">
          <div class="title-icon">
            <i class="fas fa-fire"></i>
          </div>
          <h2>PHIM ĐỀ CỬ</h2>
          <div class="title-line"></div>
        </div>
        <a href="${pageContext.request.contextPath}/movies" class="view-all">
          <span>Xem tất cả</span>
          <i class="fas fa-arrow-right"></i>
        </a>
      </div>

      <div class="movies-grid">
        <c:forEach var="movie" items="${featuredMovies}" varStatus="status">
          <div class="movie-card featured">
            <div class="movie-poster">
              <img src="${movie.posterUrl != null ? movie.posterUrl : 'https://placehold.co/300x450/1a1a2e/ffffff?text=Movie'}" alt="${movie.title}" />
              <div class="movie-rank">${status.index + 1}</div>
              <div class="trending-badge">
                <i class="fas fa-fire"></i>
                <span>Trending</span>
              </div>
              <div class="movie-status">
                <span>Hoàn Tất (${movie.episodes != null ? movie.episodes : 1}/${movie.episodes != null ? movie.episodes : 1}) Vietsub + Thuyết</span>
              </div>
              <div class="movie-overlay">
                <div class="movie-actions">
                  <a href="${pageContext.request.contextPath}/movies/${movie.id}" class="btn-detail">
                    <i class="fas fa-info-circle"></i>
                    <span>Chi tiết</span>
                  </a>
                  <form action="${pageContext.request.contextPath}/booking" method="get" style="display:inline;">
                    <input type="hidden" name="movieId" value="${movie.id}" />
                    <button type="submit" class="btn-book">
                      <i class="fas fa-ticket-alt"></i>
                      <span>Đặt vé</span>
                    </button>
                  </form>
                </div>
              </div>
              <c:if test="${movie.rating > 0}">
                <div class="movie-rating">
                  <i class="fas fa-star"></i>
                  <span><fmt:formatNumber value="${movie.rating}" pattern="#.#"/></span>
                </div>
              </c:if>
            </div>
            <div class="movie-info">
              <h3 class="vietnamese-title">${movie.title}</h3>
              <h4 class="english-title">${movie.originalTitle != null ? movie.originalTitle : movie.title}</h4>
              <div class="movie-meta">
                <span class="movie-genre">${movie.genre}</span>
                <c:if test="${movie.duration != null}">
                  <span class="movie-duration">${movie.duration} phút</span>
                </c:if>
              </div>
              <c:if test="${movie.price != null}">
                <div class="movie-price">
                  <span class="price"><fmt:formatNumber value="${movie.price}" type="currency" currencySymbol="₫" maxFractionDigits="0"/></span>
                </div>
              </c:if>
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
      <div class="section-header">
        <div class="section-title">
          <div class="title-icon">
            <i class="fas fa-star"></i>
          </div>
          <h2>Tại sao chọn chúng tôi</h2>
          <div class="title-line"></div>
        </div>
        <p class="section-subtitle">Trải nghiệm điện ảnh tuyệt vời với những dịch vụ tốt nhất</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-ticket-alt"></i>
            <div class="icon-bg"></div>
          </div>
          <h3>Đặt vé dễ dàng</h3>
          <p>Đặt vé online nhanh chóng, thanh toán an toàn với nhiều phương thức thanh toán</p>
          <div class="feature-highlight">
            <span>100% bảo mật</span>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-film"></i>
            <div class="icon-bg"></div>
          </div>
          <h3>Công nghệ hiện đại</h3>
          <p>Hệ thống chiếu phim 4K Ultra HD, âm thanh Dolby Atmos chất lượng cao</p>
          <div class="feature-highlight">
            <span>4K UHD</span>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-couch"></i>
            <div class="icon-bg"></div>
          </div>
          <h3>Ghế ngồi thoải mái</h3>
          <p>Ghế ngồi cao cấp, có thể điều chỉnh và massage tự động</p>
          <div class="feature-highlight">
            <span>Premium</span>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-utensils"></i>
            <div class="icon-bg"></div>
          </div>
          <h3>Dịch vụ ăn uống</h3>
          <p>Đặt đồ ăn và thức uống ngay tại chỗ, phục vụ tận nơi</p>
          <div class="feature-highlight">
            <span>24/7</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Section -->
  <section class="newsletter">
    <div class="newsletter-background">
      <div class="newsletter-overlay"></div>
    </div>
    <div class="container">
      <div class="newsletter-content">
        <div class="newsletter-text">
          <div class="newsletter-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <h2>Đăng ký nhận thông báo</h2>
          <p>Nhận thông báo về phim mới, ưu đãi đặc biệt và sự kiện sắp diễn ra</p>
          <div class="newsletter-benefits">
            <div class="benefit-item">
              <i class="fas fa-check"></i>
              <span>Thông báo phim mới</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-check"></i>
              <span>Ưu đãi đặc biệt</span>
            </div>
            <div class="benefit-item">
              <i class="fas fa-check"></i>
              <span>Sự kiện độc quyền</span>
            </div>
          </div>
        </div>
        <div class="newsletter-form">
          <form action="${pageContext.request.contextPath}/newsletter/subscribe" method="post" class="form-group">
            <input type="email" name="email" placeholder="Nhập email của bạn" class="email-input" required />
            <button type="submit" class="btn-subscribe">
              <i class="fas fa-paper-plane"></i>
              <span>Đăng ký</span>
            </button>
          </form>
          <p class="newsletter-note">Chúng tôi cam kết không spam và bảo mật thông tin của bạn</p>
        </div>
      </div>
    </div>
  </section>
</div>
<script>
  // Add any necessary JavaScript here for interactivity if needed
</script>
</body>
</html>
