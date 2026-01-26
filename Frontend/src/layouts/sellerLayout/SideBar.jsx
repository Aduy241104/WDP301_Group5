import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Folder,
  Package,
  Warehouse,
  ShoppingCart,
  RotateCcw,
  Star,
  Bell,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/seller/dashboard",
  },
  {
    label: "Manage Pickup Address Store",
    icon: Store,
    path: "/seller/store",
  },
  {
    label: "Categories",
    icon: Folder,
    path: "/seller/categories",
  },
  {
    label: "Products",
    icon: Package,
    path: "/seller/products",
  },
  {
    label: "Inventory",
    icon: Warehouse,
    path: "/seller/inventory",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    path: "/seller/orders",
  },
  {
    label: "Returns",
    icon: RotateCcw,
    path: "/seller/returns",
  },
  {
    label: "Reviews",
    icon: Star,
    path: "/seller/reviews",
  },
  {
    label: "Notifications",
    icon: Bell,
    path: "/seller/notifications",
  },
];

export default function Sidebar() {
  return (
    <aside className="h-full flex flex-col bg-[#1f2933] text-gray-300">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Seller Center
        </h2>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium
                transition
                ${
                  isActive
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-700 hover:text-white"
                }
                `
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
