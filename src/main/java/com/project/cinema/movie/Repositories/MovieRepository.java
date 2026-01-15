package com.project.cinema.movie.Repositories;

import com.project.cinema.movie.Models.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByReleaseDateBefore(Date currentDate);
    List<Movie> findByReleaseDateAfter(Date currentDate);
    List<Movie> findByReleaseDateBeforeAndStatus(Date currentDate, String status);
    List<Movie> findByReleaseDateAfterAndStatus(Date currentDate, String status);
    @Query("SELECT m FROM Movie m WHERE m.releaseDate <= :currentDate AND m.status = :status")
    List<Movie> findByReleaseDateBeforeOrEqualAndStatus(@Param("currentDate") Date currentDate, @Param("status") String status);
    boolean existsByTitle(String title);
    boolean existsByTitleIgnoreCase(String title);
    Optional<Movie> findByTitleIgnoreCase(String title);
    // Thống kê doanh thu tổng
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.order.status = 'CONFIRMED'")
    Double calculateTotalRevenue();
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.order.status = 'CONFIRMED'")
    Long countTotalBookings();
    
    // Thống kê doanh thu theo phim
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b JOIN b.showtime s WHERE s.movie.id = :movieId AND b.order.status = 'CONFIRMED'")
    Double calculateMovieRevenue(@Param("movieId") Long movieId);
    
    @Query("SELECT COUNT(b) FROM Booking b JOIN b.showtime s WHERE s.movie.id = :movieId AND b.order.status = 'CONFIRMED'")
    Long countMovieBookings(@Param("movieId") Long movieId);
    
    // Thống kê phim theo trạng thái
    @Query("SELECT COUNT(m) FROM Movie m WHERE m.status = :status")
    Long countByStatus(@Param("status") String status);
    
    // Thống kê phim theo thể loại
    @Query("SELECT m.genre as genre, COUNT(m) as count FROM Movie m GROUP BY m.genre")
    List<Map<String, Object>> getMovieCountByGenre();
    
    // Phim có doanh thu cao nhất
    @Query("SELECT m.title as title, COALESCE(SUM(b.totalPrice), 0) as revenue FROM Movie m " +
           "LEFT JOIN Showtime s ON s.movie = m " +
           "LEFT JOIN Booking b ON b.showtime = s " +
           "WHERE b.order.status = 'CONFIRMED' OR b.order.status IS NULL " +
           "GROUP BY m.id, m.title " +
           "ORDER BY revenue DESC " +
           "LIMIT :limit")
    List<Map<String, Object>> findTopMoviesByRevenue(@Param("limit") int limit);
    
    // Phim mới nhất
    @Query("SELECT m.title as title, m.createdAt as createdAt, m.status as status FROM Movie m " +
           "ORDER BY m.createdAt DESC " +
           "LIMIT :limit")
    List<Map<String, Object>> findRecentMovies(@Param("limit") int limit);
    
    // Tìm kiếm phim cơ bản
    @Query("SELECT m FROM Movie m WHERE m.title LIKE %:query% OR m.director LIKE %:query% OR m.genre LIKE %:query%")
    List<Movie> searchMovies(@Param("query") String query);
    
    // Tìm kiếm phim nâng cao
    @Query("SELECT m FROM Movie m WHERE " +
           "(:title IS NULL OR m.title LIKE %:title%) AND " +
           "(:genre IS NULL OR m.genre LIKE %:genre%) AND " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:minRating IS NULL OR m.rating >= :minRating) AND " +
           "(:maxRating IS NULL OR m.rating <= :maxRating) AND " +
           "(:minPrice IS NULL OR m.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR m.price <= :maxPrice)")
    List<Movie> advancedSearch(
        @Param("title") String title,
        @Param("genre") String genre,
        @Param("status") String status,
        @Param("minRating") Double minRating,
        @Param("maxRating") Double maxRating,
        @Param("minPrice") Double minPrice,
        @Param("maxPrice") Double maxPrice
    );

    // Tìm phim theo thể loại (không phân biệt hoa thường)
    List<Movie> findByGenreContainingIgnoreCase(String genre);

    // Lấy tất cả thể loại phim
    @Query("SELECT DISTINCT m.genre FROM Movie m ORDER BY m.genre")
    List<String> findAllGenres();
}