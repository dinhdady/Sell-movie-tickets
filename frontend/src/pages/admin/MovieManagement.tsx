import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CalendarIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { movieAPI, showtimeAPI, cinemaAPI, roomAPI } from '../../services/api';
import type { Movie, Showtime } from '../../types/movie';
import MovieInfoCard from '../../components/MovieInfoCard';
const MovieManagement: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [showAddShowtimeModal, setShowAddShowtimeModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    duration: 0,
    releaseDate: '',
    genre: '',
    director: '',
    trailerUrl: '',
    language: '',
    cast: '',
    rating: 0,
    status: 'COMING_SOON',
    price: 0,
    filmRating: 'G'
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [showtimeFormData, setShowtimeFormData] = useState({
    startTime: '',
    endTime: '',
    roomId: 0,
    cinemaId: 0
  });
  const [isRecurringMode, setIsRecurringMode] = useState(false);
  const [recurringFormData, setRecurringFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    roomId: 0,
    cinemaId: 0
  });
  useEffect(() => {
    fetchMovies();
    fetchCinemas();
  }, [currentPage]);
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieAPI.getAll(currentPage - 1, itemsPerPage);
      if (response.movies) {
        setMovies(response.movies as any[]);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const fetchCinemas = async () => {
    try {
      const response = await cinemaAPI.getAll();
      if (response.state === 'SUCCESS') {
        setCinemas(response.object as any[]);
      }
    } catch (error) {
    }
  };
  const fetchRooms = async (cinemaId: number) => {
    try {
      const response = await roomAPI.getAll();
      if (response.state === 'SUCCESS') {
        const allRooms = response.object as any[];
        const filteredRooms = allRooms.filter(room => room.cinemaId === cinemaId);
        setRooms(filteredRooms);
      }
    } catch (error) {
    }
  };
  const fetchShowtimes = async (movieId: number) => {
    try {
      const response = await showtimeAPI.getByMovie(movieId);
      if (response.state === 'SUCCESS' || response.state === '200') {
        const showtimes = response.object as any[];
        setShowtimes(showtimes);
      } else {
        setShowtimes([]);
      }
    } catch (error) {
      setShowtimes([]);
    }
  };
  const handleCreateMovie = async () => {
    try {
      const response = await movieAPI.create(formData as any, posterFile || undefined);
      if (response.state === '201' || response.state === 'SUCCESS') {
        fetchMovies();
        setShowModal(false);
        resetForm();
        alert('Tạo phim thành công!');
      } else {
        alert('Lỗi khi tạo phim: ' + response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo phim';
      alert(errorMessage);
    }
  };
  const handleUpdateMovie = async () => {
    if (!selectedMovie) return;
    try {
      const response = await movieAPI.update(selectedMovie.id, formData as any, posterFile || undefined);
      if (response.state === '200' || response.state === 'SUCCESS') {
        fetchMovies();
        setShowModal(false);
        setSelectedMovie(null);
        resetForm();
        alert('Cập nhật phim thành công!');
      } else {
        alert('Lỗi khi cập nhật phim: ' + response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật phim';
      alert(errorMessage);
    }
  };
  const handleDeleteMovie = async (movieId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      try {
        const response = await movieAPI.delete(movieId);
        if (response.state === '200' || response.state === 'SUCCESS') {
          fetchMovies();
          alert('Xóa phim thành công!');
        } else {
          alert('Lỗi khi xóa phim: ' + response.message);
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa phim');
      }
    }
  };
  const handleEditMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      genre: movie.genre,
      director: movie.director,
      trailerUrl: movie.trailerUrl,
      language: (movie as any).language || '',
      cast: movie.cast,
      rating: movie.rating,
      status: movie.status,
      price: movie.price,
      filmRating: movie.filmRating
    });
    setPosterFile(null); // Reset poster file when editing
    setShowModal(true);
  };
  const handleViewShowtimes = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowtimes([]); // Reset showtimes first
    fetchShowtimes(movie.id);
    setShowShowtimeModal(true);
  };
  const handleAddShowtime = () => {
    if (!selectedMovie) return;
    setShowtimeFormData({
      startTime: '',
      endTime: '',
      roomId: 0,
      cinemaId: 0
    });
    setRecurringFormData({
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      roomId: 0,
      cinemaId: 0
    });
    setIsRecurringMode(false);
    setRooms([]);
    setShowAddShowtimeModal(true);
  };
  const handleCreateShowtime = async () => {
    if (!selectedMovie) return;
    try {
      if (isRecurringMode) {
        // Create recurring showtimes
        const recurringData = {
          movieId: selectedMovie.id,
          roomId: recurringFormData.roomId,
          startDate: recurringFormData.startDate,
          endDate: recurringFormData.endDate,
          startTime: recurringFormData.startTime,
          endTime: recurringFormData.endTime
        };
        const response = await showtimeAPI.createRecurring(recurringData);
        if (response.state === '201' || response.state === 'SUCCESS') {
          fetchShowtimes(selectedMovie.id);
          setShowAddShowtimeModal(false);
          const count = response.object?.count || 0;
          alert(`Đã tạo thành công ${count} suất chiếu định kỳ!`);
        } else {
          alert('Lỗi khi thêm suất chiếu định kỳ: ' + response.message);
        }
      } else {
        // Create single showtime
        const showtimeData = {
          movieId: selectedMovie.id,
          roomId: showtimeFormData.roomId,
          startTime: showtimeFormData.startTime,
          endTime: showtimeFormData.endTime
        };
        const response = await showtimeAPI.create(showtimeData);
        if (response.state === '201' || response.state === 'SUCCESS') {
          fetchShowtimes(selectedMovie.id);
          setShowAddShowtimeModal(false);
          alert('Thêm suất chiếu thành công!');
        } else {
          alert('Lỗi khi thêm suất chiếu: ' + response.message);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm suất chiếu';
      alert(errorMessage);
    }
  };
  const handleDeleteShowtime = async (showtimeId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      try {
        const response = await showtimeAPI.delete(showtimeId);
        if (response.state === '200' || response.state === 'SUCCESS') {
          if (selectedMovie) {
            fetchShowtimes(selectedMovie.id);
          }
          alert('Xóa suất chiếu thành công!');
        } else {
          alert('Lỗi khi xóa suất chiếu: ' + response.message);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa suất chiếu';
        alert(errorMessage);
      }
    }
  };
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      duration: 0,
      releaseDate: '',
      genre: '',
      director: '',
      trailerUrl: '',
      language: '',
      cast: '',
      rating: 0,
      status: 'COMING_SOON',
      price: 0,
      filmRating: 'G'
    });
    setPosterFile(null);
    setSelectedMovie(null);
  };
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.director.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('vi-VN');
  };
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý phim</h1>
        <p className="text-gray-600">Quản lý danh sách phim và suất chiếu</p>
      </div>
      {/* Search and Add Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm phim mới
        </button>
      </div>
      {/* Movies Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thể loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đạo diễn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày phát hành
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá vé
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : filteredMovies.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Không có phim nào
                </td>
              </tr>
            ) : (
              filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-12">
                        {movie.posterUrl ? (
                          <img
                            className="h-16 w-12 object-cover rounded"
                            src={movie.posterUrl}
                            alt={movie.title}
                          />
                        ) : (
                          <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                            <FilmIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                        <div className="text-sm text-gray-500">{(movie as any).language || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{movie.genre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{movie.director}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(movie.releaseDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      movie.status === 'NOW_SHOWING' 
                        ? 'bg-green-100 text-green-800' 
                        : movie.status === 'COMING_SOON'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 
                       movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Kết thúc'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movie.price.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewShowtimes(movie)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem suất chiếu"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditMovie(movie)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </nav>
        </div>
      )}
      {/* Movie Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên phim *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại *</label>
                  <input
                    type="text"
                    value={formData.genre || ''}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đạo diễn *</label>
                  <input
                    type="text"
                    value={formData.director || ''}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diễn viên</label>
                  <input
                    type="text"
                    value={formData.cast || ''}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút) *</label>
                  <input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày phát hành *</label>
                  <input
                    type="date"
                    value={formData.releaseDate || ''}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
                  <input
                    type="text"
                    value={formData.language || ''}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status || 'COMING_SOON'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="COMING_SOON">Sắp chiếu</option>
                    <option value="NOW_SHOWING">Đang chiếu</option>
                    <option value="ENDED">Kết thúc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Độ tuổi</label>
                  <select
                    value={formData.filmRating || 'G'}
                    onChange={(e) => setFormData({ ...formData, filmRating: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="G">G - Mọi lứa tuổi</option>
                    <option value="PG">PG - Trên 13 tuổi</option>
                    <option value="PG13">PG13 - Trên 16 tuổi</option>
                    <option value="R">R - Trên 18 tuổi</option>
                    <option value="NC17">NC17 - Chỉ người lớn</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poster</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {posterFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      Đã chọn: {posterFile.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Trailer</label>
                  <input
                    type="url"
                    value={formData.trailerUrl || ''}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={selectedMovie ? handleUpdateMovie : handleCreateMovie}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {selectedMovie ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Showtimes Modal */}
      {showShowtimeModal && selectedMovie && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Suất chiếu - {selectedMovie.title}
                </h3>
                <button
                  onClick={() => setShowShowtimeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <button
                  onClick={handleAddShowtime}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Thêm suất chiếu
                </button>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian bắt đầu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian kết thúc
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng chiếu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rạp chiếu
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {showtimes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          {selectedMovie ? `Chưa có suất chiếu nào cho phim "${selectedMovie.title}"` : 'Chưa có suất chiếu nào'}
                        </td>
                      </tr>
                    ) : (
                      showtimes.map((showtime) => (
                        <tr key={showtime.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(showtime.startTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTime(showtime.endTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(showtime as any).roomName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(showtime as any).cinemaName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  // TODO: Implement edit showtime functionality
                                  alert('Tính năng chỉnh sửa suất chiếu sẽ được triển khai');
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteShowtime(showtime.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Xóa"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Showtime Modal */}
      {showAddShowtimeModal && selectedMovie && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Thêm suất chiếu - {selectedMovie.title}
                </h3>
                <button
                  onClick={() => setShowAddShowtimeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Movie Information Display */}
              <MovieInfoCard movie={selectedMovie} />
              
              {/* Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Chế độ tạo suất chiếu</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="showtimeMode"
                      checked={!isRecurringMode}
                      onChange={() => setIsRecurringMode(false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Tạo một suất chiếu</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="showtimeMode"
                      checked={isRecurringMode}
                      onChange={() => setIsRecurringMode(true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Tạo suất chiếu định kỳ (liên tục)</span>
                  </label>
                </div>
              </div>

              {/* Current Showtimes Display */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Suất chiếu hiện có ({showtimes.length})
                  {selectedMovie && (
                    <span className="text-sm text-gray-500 ml-2">
                      cho phim "{selectedMovie.title}"
                    </span>
                  )}
                </h4>
                {showtimes.length > 0 ? (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="max-h-40 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thời gian
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phòng chiếu
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rạp chiếu
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showtimes.slice(0, 5).map((showtime) => (
                            <tr key={showtime.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {(showtime as any).roomName || 'N/A'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {(showtime as any).cinemaName || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {showtimes.length > 5 && (
                      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                        Và {showtimes.length - 5} suất chiếu khác...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border rounded-lg p-4 text-center text-gray-500">
                    Chưa có suất chiếu nào cho phim này
                  </div>
                )}
              </div>
              {!isRecurringMode ? (
                // Single showtime form
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rạp chiếu *</label>
                    <select
                      value={showtimeFormData.cinemaId}
                      onChange={(e) => {
                        const cinemaId = parseInt(e.target.value);
                        setShowtimeFormData({ ...showtimeFormData, cinemaId, roomId: 0 });
                        fetchRooms(cinemaId);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={0}>Chọn rạp chiếu</option>
                      {cinemas.map((cinema) => (
                        <option key={cinema.id} value={cinema.id}>
                          {cinema.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng chiếu *</label>
                    <select
                      value={showtimeFormData.roomId}
                      onChange={(e) => setShowtimeFormData({ ...showtimeFormData, roomId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={showtimeFormData.cinemaId === 0}
                    >
                      <option value={0}>Chọn phòng chiếu</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} ({room.capacity} ghế)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu *</label>
                    <input
                      type="datetime-local"
                      value={showtimeFormData.startTime}
                      onChange={(e) => setShowtimeFormData({ ...showtimeFormData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc *</label>
                    <input
                      type="datetime-local"
                      value={showtimeFormData.endTime}
                      onChange={(e) => setShowtimeFormData({ ...showtimeFormData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              ) : (
                // Recurring showtimes form
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Lưu ý:</strong> Hệ thống sẽ tạo suất chiếu cho mỗi ngày từ ngày bắt đầu đến ngày kết thúc, 
                      với cùng một khung giờ chiếu (ví dụ: 18:00 - 20:30 mỗi ngày).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rạp chiếu *</label>
                      <select
                        value={recurringFormData.cinemaId}
                        onChange={(e) => {
                          const cinemaId = parseInt(e.target.value);
                          setRecurringFormData({ ...recurringFormData, cinemaId, roomId: 0 });
                          fetchRooms(cinemaId);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value={0}>Chọn rạp chiếu</option>
                        {cinemas.map((cinema) => (
                          <option key={cinema.id} value={cinema.id}>
                            {cinema.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phòng chiếu *</label>
                      <select
                        value={recurringFormData.roomId}
                        onChange={(e) => setRecurringFormData({ ...recurringFormData, roomId: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={recurringFormData.cinemaId === 0}
                      >
                        <option value={0}>Chọn phòng chiếu</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name} ({room.capacity} ghế)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                      <input
                        type="date"
                        value={recurringFormData.startDate}
                        onChange={(e) => setRecurringFormData({ ...recurringFormData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                      <input
                        type="date"
                        value={recurringFormData.endDate}
                        onChange={(e) => setRecurringFormData({ ...recurringFormData, endDate: e.target.value })}
                        min={recurringFormData.startDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu *</label>
                      <input
                        type="time"
                        value={recurringFormData.startTime}
                        onChange={(e) => setRecurringFormData({ ...recurringFormData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc *</label>
                      <input
                        type="time"
                        value={recurringFormData.endTime}
                        onChange={(e) => setRecurringFormData({ ...recurringFormData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  {recurringFormData.startDate && recurringFormData.endDate && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        <strong>Dự kiến tạo:</strong> Sẽ tạo suất chiếu từ{' '}
                        <strong>{new Date(recurringFormData.startDate).toLocaleDateString('vi-VN')}</strong> đến{' '}
                        <strong>{new Date(recurringFormData.endDate).toLocaleDateString('vi-VN')}</strong>
                        {recurringFormData.startTime && recurringFormData.endTime && (
                          <>
                            {' '}vào lúc <strong>{recurringFormData.startTime}</strong> - <strong>{recurringFormData.endTime}</strong>
                          </>
                        )}
                        . Tổng cộng:{' '}
                        <strong>
                          {Math.ceil(
                            (new Date(recurringFormData.endDate).getTime() - new Date(recurringFormData.startDate).getTime()) /
                              (1000 * 60 * 60 * 24) + 1
                          )}{' '}
                          suất chiếu
                        </strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddShowtimeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateShowtime}
                  disabled={
                    isRecurringMode
                      ? !recurringFormData.cinemaId ||
                        !recurringFormData.roomId ||
                        !recurringFormData.startDate ||
                        !recurringFormData.endDate ||
                        !recurringFormData.startTime ||
                        !recurringFormData.endTime
                      : !showtimeFormData.cinemaId ||
                        !showtimeFormData.roomId ||
                        !showtimeFormData.startTime ||
                        !showtimeFormData.endTime
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRecurringMode ? 'Tạo suất chiếu định kỳ' : 'Thêm suất chiếu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MovieManagement;
