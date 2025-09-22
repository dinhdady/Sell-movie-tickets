import React, { useState, useEffect } from 'react';
import {
  TicketIcon,
  FilmIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { bookingAPI, dashboardAPI, userAPI, movieAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
interface DashboardStats {
  totalBookings: number;
  totalMovies: number;
  totalUsers: number;
  totalRevenue: number;
  bookingsToday: number;
  revenueToday: number;
  bookingsGrowth: number;
  revenueGrowth: number;
}
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalMovies: 0,
    totalUsers: 0,
    totalRevenue: 0,
    bookingsToday: 0,
    revenueToday: 0,
    bookingsGrowth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard overview from backend
      const overviewResponse = await dashboardAPI.getOverview();
      if (overviewResponse.state === '200') {
        const overview = overviewResponse.object;
        setStats({
          totalBookings: overview.totalBookings || 0,
          totalMovies: overview.totalMovies || 0,
          totalUsers: overview.totalUsers || 0,
          totalRevenue: overview.totalRevenue || 0,
          bookingsToday: overview.bookingsToday || 0,
          revenueToday: overview.revenueToday || 0,
          bookingsGrowth: overview.bookingsGrowth || 0,
          revenueGrowth: overview.revenueGrowth || 0
        });
      } else {
        // Fallback to individual API calls
        await fetchFallbackData();
      }
    } catch (error) {
      // Fallback to individual API calls
      await fetchFallbackData();
    } finally {
      setLoading(false);
    }
  };
  const fetchFallbackData = async () => {
    try {
      // Fetch data from individual APIs
      const [bookingsResponse, moviesResponse, usersResponse] = await Promise.all([
        bookingAPI.getAll(),
        movieAPI.getAll(),
        userAPI.getAllUsers()
      ]);
      const bookings = bookingsResponse || [];
      const movies = moviesResponse.movies || [];
      const users = usersResponse.object || [];
      // Calculate stats
      const totalBookings = bookings.length;
      const totalMovies = movies.length;
      const totalUsers = users.length;
      const totalRevenue = bookings.reduce((sum: number, booking: any) => sum + (booking.totalPrice || 0), 0);
      const bookingsToday = bookings.filter((booking: any) => {
        const today = new Date();
        const dateString = booking.createdAt || booking.bookingDate;
        if (!dateString) return false;
        const bookingDate = new Date(dateString);
        return bookingDate.toDateString() === today.toDateString();
      }).length;
      const revenueToday = bookings.filter((booking: any) => {
        const today = new Date();
        const dateString = booking.createdAt || booking.bookingDate;
        if (!dateString) return false;
        const bookingDate = new Date(dateString);
        return bookingDate.toDateString() === today.toDateString();
      }).reduce((sum: number, booking: any) => sum + (booking.totalPrice || 0), 0);
      setStats({
        totalBookings,
        totalMovies,
        totalUsers,
        totalRevenue,
        bookingsToday,
        revenueToday,
        bookingsGrowth: 12.5, // Mock data
        revenueGrowth: 8.3 // Mock data
      });
    } catch (error) {
    }
  };
  const statCards = [
    {
      name: 'Tổng đặt vé',
      value: stats.totalBookings.toLocaleString(),
      change: `+${stats.bookingsGrowth}%`,
      changeType: 'positive',
      icon: TicketIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Tổng phim',
      value: stats.totalMovies.toLocaleString(),
      change: '+2',
      changeType: 'positive',
      icon: FilmIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Tổng người dùng',
      value: stats.totalUsers.toLocaleString(),
      change: '+15',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Tổng doanh thu',
      value: `${stats.totalRevenue.toLocaleString()} VNĐ`,
      change: `+${stats.revenueGrowth}%`,
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    }
  ];
  const todayStats = [
    {
      name: 'Đặt vé hôm nay',
      value: stats.bookingsToday,
      icon: TicketIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Doanh thu hôm nay',
      value: `${stats.revenueToday.toLocaleString()} VNĐ`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    }
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
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">Chào mừng trở lại, {user?.username || 'Admin'}!</h1>
            <p className="text-blue-100 mt-1">
              Đây là bảng điều khiển quản trị của hệ thống rạp chiếu phim
            </p>
          </div>
        </div>
      </div>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tổng quan về hệ thống quản lý rạp chiếu phim
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${card.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {card.changeType === 'positive' ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                          )}
                          <span className="sr-only">
                            {card.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                          </span>
                          {card.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Today's Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Thống kê hôm nay
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {todayStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/movies"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <FilmIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Quản lý phim
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Thêm, sửa, xóa phim
                </p>
              </div>
            </a>
            <a
              href="/admin/bookings"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <TicketIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Quản lý đặt vé
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Xem và quản lý đặt vé
                </p>
              </div>
            </a>
            <a
              href="/admin/users"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                  <UserGroupIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Quản lý người dùng
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Quản lý tài khoản người dùng
                </p>
              </div>
            </a>
            <a
              href="/admin/statistics"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" />
                  Thống kê chi tiết
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Xem báo cáo và thống kê
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
