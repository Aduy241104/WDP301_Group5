import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export default function SellerDashboard() {
  return (
    <div className="space-y-8">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Xin chào, <span className="font-medium">Seller A</span> 👋
        </p>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu hôm nay"
          value="5,200,000đ"
          icon={<DollarSign />}
          bg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Đơn hàng mới"
          value="18"
          icon={<ShoppingCart />}
          bg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Sản phẩm đang bán"
          value="120"
          icon={<Package />}
          bg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Sắp hết hàng"
          value="6"
          icon={<AlertTriangle />}
          bg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/seller/orders"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Order Management
          </Link>
          <Link
            to="/seller/products"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
          >
            Product Management
          </Link>
          <Link
            to="/seller/inventory"
            className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Inventory
          </Link>
        </div>
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            to="/seller/orders"
            className="text-indigo-600 hover:underline text-sm"
          >
            View all
          </Link>
        </div>

        <ul className="space-y-3 text-sm">
          <li className="flex justify-between">
            <span>#ORD001</span>
            <span className="text-blue-600">Shipped</span>
          </li>
          <li className="flex justify-between">
            <span>#ORD002</span>
            <span className="text-green-600">Delivered</span>
          </li>
          <li className="flex justify-between">
            <span>#ORD003</span>
            <span className="text-red-600">Cancelled</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ===== STAT CARD COMPONENT ===== */
function StatCard({ title, value, icon, bg, iconColor }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${bg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
