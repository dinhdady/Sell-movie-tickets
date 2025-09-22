import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Trang không tìm thấy
          </h2>
          <p className="text-gray-600">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Về trang chủ
          </Link>
          <div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
