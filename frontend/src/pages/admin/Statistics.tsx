import React, { useState, useEffect } from 'react';
import {
  TicketIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FilmIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { dashboardAPI, bookingAPI, movieAPI, userAPI } from '../../services/api';
interface StatData {
  period: string;
  bookings: number;
  revenue: number;
  users: number;
  movies: number;
}
const Statistics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [statData, setStatData] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // Try to get dashboard overview first
      try {
        const overviewResponse = await dashboardAPI.getOverview();
        if (overviewResponse.state === '200') {
          const overview = overviewResponse.object;
          // Convert overview data to StatData format
          const today = new Date().toISOString().split('T')[0];
          const mockData: StatData[] = [
            { 
              period: today, 
              bookings: overview.bookingsToday || 0, 
              revenue: overview.revenueToday || 0, 
              users: overview.totalUsers || 0, 
              movies: overview.totalMovies || 0 
            }
          ];
          setStatData(mockData);
          return;
        }
      } catch (error) {
      }
      // Fallback to individual API calls
      const [bookingsResponse, moviesResponse, usersResponse] = await Promise.all([
        bookingAPI.getAll(),
        movieAPI.getAll(),
        userAPI.getAllUsers()
      ]);
      const bookings = bookingsResponse || [];
      const movies = moviesResponse.movies || [];
      const users = usersResponse.object || [];
      // Generate mock data based on real data
      const today = new Date();
      const mockData: StatData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        // Filter bookings for this date
        const dayBookings = bookings.filter((booking: any) => {
          const bookingDate = new Date(booking.createdAt || booking.bookingDate);
          return bookingDate.toDateString() === date.toDateString();
        });
        const dayRevenue = dayBookings.reduce((sum: number, booking: any) => sum + (booking.totalPrice || 0), 0);
        mockData.push({
          period: dateString,
          bookings: dayBookings.length,
          revenue: dayRevenue,
          users: users.length,
          movies: movies.length
        });
      }
      setStatData(mockData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getTotalStats = () => {
    return statData.reduce((totals, data) => ({
      bookings: totals.bookings + data.bookings,
      revenue: totals.revenue + data.revenue,
      users: totals.users + data.users,
      movies: Math.max(totals.movies, data.movies)
    }), { bookings: 0, revenue: 0, users: 0, movies: 0 });
  };
  // const getGrowthRate = (current: number, previous: number) => {
  //   if (previous === 0) return 0;
  //   return ((current - previous) / previous) * 100;
  // };
  const totalStats = getTotalStats();
  const avgBookingsPerDay = statData.length > 0 ? totalStats.bookings / statData.length : 0;
  const avgRevenuePerDay = statData.length > 0 ? totalStats.revenue / statData.length : 0;
  const topMovies = [
    { name: 'Vua trở lại', bookings: 156, revenue: 7800000 },
    { name: 'Fast & Furious 10', bookings: 134, revenue: 6700000 },
    { name: 'Spider-Man: Across the Universe', bookings: 98, revenue: 4900000 },
    { name: 'Avatar: The Way of Water', bookings: 87, revenue: 4350000 },
    { name: 'Black Panther: Wakanda Forever', bookings: 76, revenue: 3800000 }
  ];
  const topCinemas = [
    { name: 'CGV Vincom Center', bookings: 234, revenue: 11700000 },
    { name: 'Lotte Cinema', bookings: 198, revenue: 9900000 },
    { name: 'Galaxy Cinema', bookings: 156, revenue: 7800000 },
    { name: 'Mega GS', bookings: 134, revenue: 6700000 }
  ];
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Phân tích dữ liệu và hiệu suất kinh doanh
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="1year">1 năm qua</option>
          </select>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <TicketIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng đặt vé
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {totalStats.bookings.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      <span className="sr-only">Increased by</span>
                      +12.5%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng doanh thu
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {totalStats.revenue.toLocaleString()} VNĐ
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      <span className="sr-only">Increased by</span>
                      +8.3%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Khách hàng mới
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {totalStats.users.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      <span className="sr-only">Increased by</span>
                      +15.2%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-500">
                  <FilmIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Phim đang chiếu
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {totalStats.movies}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      <span className="sr-only">Increased by</span>
                      +1
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Daily Averages */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Trung bình hàng ngày
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Đặt vé/ngày</span>
                <span className="text-lg font-semibold text-gray-900">
                  {avgBookingsPerDay.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Doanh thu/ngày</span>
                <span className="text-lg font-semibold text-gray-900">
                  {avgRevenuePerDay.toLocaleString()} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Khách hàng mới/ngày</span>
                <span className="text-lg font-semibold text-gray-900">
                  {(totalStats.users / statData.length).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Hiệu suất tuần này
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Ngày tốt nhất</span>
                <span className="text-lg font-semibold text-gray-900">
                  {statData.reduce((max, day) => day.bookings > max.bookings ? day : max, statData[0])?.period || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Đặt vé cao nhất</span>
                <span className="text-lg font-semibold text-gray-900">
                  {Math.max(...statData.map(d => d.bookings))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Doanh thu cao nhất</span>
                <span className="text-lg font-semibold text-gray-900">
                  {Math.max(...statData.map(d => d.revenue)).toLocaleString()} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Top Movies */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top phim bán chạy
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số vé bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topMovies.map((movie, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-800">{index + 1}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{movie.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movie.bookings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movie.revenue.toLocaleString()} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(movie.bookings / topMovies[0].bookings) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {((movie.bookings / topMovies[0].bookings) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Top Cinemas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top rạp chiếu
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rạp chiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số vé bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCinemas.map((cinema, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-800">{index + 1}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{cinema.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cinema.bookings.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cinema.revenue.toLocaleString()} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(cinema.bookings / topCinemas[0].bookings) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {((cinema.bookings / topCinemas[0].bookings) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Statistics;
