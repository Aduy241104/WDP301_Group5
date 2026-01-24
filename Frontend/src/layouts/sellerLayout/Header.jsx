// src/layouts/sellerLayout/Header.jsx
import React from "react";
import { Bell, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left */}
      <h1 className="text-xl font-semibold text-gray-800">
        Seller Dashboard
      </h1>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img
            src="https://i.pravatar.cc/40"
            alt="avatar"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium text-gray-700">
            Tran Hoang Nha
          </span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}
