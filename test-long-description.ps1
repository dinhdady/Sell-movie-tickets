# Script để test lưu description dài
Write-Host "🧪 Testing long description functionality" -ForegroundColor Yellow

# Tạo description dài (khoảng 5000 ký tự)
$longDescription = @"
Đây là một bộ phim hành động đầy kịch tính và hấp dẫn, kể về cuộc phiêu lưu của một nhóm anh hùng trong thế giới tương lai. Bộ phim được đánh giá cao bởi cốt truyện phức tạp, diễn xuất xuất sắc của dàn diễn viên và hiệu ứng hình ảnh đỉnh cao.

Cốt truyện xoay quanh nhân vật chính - một chiến binh dũng cảm phải đối mặt với những thử thách khó khăn để bảo vệ thế giới khỏi thế lực bóng tối. Với sự giúp đỡ của những người bạn đồng hành, anh ta phải vượt qua nhiều chướng ngại vật và đối đầu với kẻ thù mạnh mẽ.

Bộ phim được thực hiện với ngân sách khổng lồ, sử dụng công nghệ CGI tiên tiến nhất để tạo ra những cảnh quay ngoạn mục. Âm thanh và nhạc phim cũng được đầu tư kỹ lưỡng, tạo nên trải nghiệm xem phim hoàn hảo.

Đạo diễn đã tạo ra một tác phẩm nghệ thuật đầy cảm xúc, kết hợp giữa hành động mãn nhãn và câu chuyện sâu sắc. Mỗi nhân vật đều có tính cách riêng biệt và phát triển qua từng phân cảnh.

Bộ phim không chỉ mang tính giải trí mà còn chứa đựng những thông điệp ý nghĩa về tình bạn, lòng dũng cảm và sự hy sinh. Đây chắc chắn sẽ là một trong những bộ phim hay nhất của năm.

Với dàn diễn viên tài năng và ê-kip sản xuất chuyên nghiệp, bộ phim hứa hẹn sẽ mang đến cho khán giả những trải nghiệm không thể quên. Đừng bỏ lỡ cơ hội thưởng thức kiệt tác điện ảnh này!

Bộ phim được quay tại nhiều địa điểm đẹp trên thế giới, từ những sa mạc rộng lớn đến những thành phố hiện đại. Mỗi cảnh quay đều được chăm chút kỹ lưỡng để tạo nên vẻ đẹp hoàn mỹ.

Âm nhạc trong phim được sáng tác bởi nhạc sĩ nổi tiếng, tạo nên không khí hùng tráng và cảm động. Mỗi giai điệu đều phù hợp với tình huống và tâm trạng của nhân vật.

Kỹ xảo trong phim được thực hiện bởi đội ngũ chuyên gia hàng đầu thế giới, tạo ra những cảnh tượng ngoạn mục và chân thực. Khán giả sẽ được đắm chìm trong thế giới tưởng tượng đầy màu sắc.

Bộ phim đã nhận được nhiều giải thưởng danh giá và được giới phê bình đánh giá cao. Đây là một tác phẩm không thể bỏ qua cho những ai yêu thích thể loại hành động và phiêu lưu.

Với thời lượng hơn 2 giờ, bộ phim sẽ mang đến cho khán giả một hành trình đầy cảm xúc và thú vị. Hãy chuẩn bị tinh thần để trải nghiệm một cuộc phiêu lưu không thể quên!
"@

Write-Host "📏 Description length: $($longDescription.Length) characters" -ForegroundColor Blue

# Test data
$movieData = @{
    title = "Test Movie with Long Description"
    description = $longDescription
    duration = 150
    releaseDate = "2024-12-25"
    genre = "Action, Adventure"
    director = "Test Director"
    trailerUrl = "https://example.com/trailer"
    language = "Vietnamese"
    cast = "Test Cast 1, Test Cast 2, Test Cast 3"
    rating = 9.0
    status = "NOW_SHOWING"
    price = 150000
    filmRating = "PG13"
}

Write-Host "`n🔍 Testing movie creation with long description..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/movie/add" -Method POST -Form $movieData
    Write-Host "✅ Success: $($response.message)" -ForegroundColor Green
    Write-Host "Movie ID: $($response.data.id)" -ForegroundColor Green
    Write-Host "Description length saved: $($response.data.description.Length) characters" -ForegroundColor Green
    
    # Kiểm tra description đã được lưu đúng
    if ($response.data.description.Length -eq $longDescription.Length) {
        Write-Host "✅ Description saved completely!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Description may have been truncated" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Test completed" -ForegroundColor Blue
