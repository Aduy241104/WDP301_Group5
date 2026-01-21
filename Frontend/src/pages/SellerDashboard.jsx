// src/App.jsx hoặc Dashboard.jsx
import React from 'react';

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">Seller Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Avatar, thông báo, tên người dùng... */}
            <span className="text-gray-700">Xin chào, Tran Hoang Nha</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Tổng quan</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Doanh thu hôm nay</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">18.450.000 ₫</p>
            <p className="text-sm text-green-600 mt-2">+12% so với hôm qua</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Doanh thu tháng này</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">248.700.000 ₫</p>
            <p className="text-sm text-green-600 mt-2">+8% so với tháng trước</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Đơn hàng mới</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">42</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Đơn đang chờ xử lý</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">15</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu theo ngày</h3>
          <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            {/* Placeholder cho biểu đồ – sau này thay bằng Recharts */}
            <p className="text-gray-500">Biểu đồ doanh thu sẽ hiển thị ở đây (Line Chart)</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;