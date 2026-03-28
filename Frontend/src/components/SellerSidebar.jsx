import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Boxes,
  Package,
  Warehouse,
  ShoppingCart,
  RotateCcw,
  Star,
  Bell,
  Image,
  Users,
  FileText,
} from "lucide-react";

const menu = [
  { label: "Dashboard", to: "/seller", icon: LayoutDashboard, end: true },
  {
    label: "Store Information",
    to: "/seller/store-information",
    icon: Store,
    end: true,
  },
  {
    label: "Manage Pickup Address",
    to: "/seller/pickup-addresses",
    icon: Store,
    end: true,
  },
  { label: "Categories", to: "/seller/categories", icon: Boxes, end: true },
  { label: "Products", to: "/seller/products", icon: Package, end: true },
  { label: "Followers", to: "/seller/followers", icon: Users, end: false },
  { label: "Banners", to: "/seller/banners", icon: Image, end: true },
  { label: "Inventory", to: "/seller/inventory", icon: Warehouse, end: true },
  { label: "Orders", to: "/seller/orders", icon: ShoppingCart, end: false },
  { label: "Reviews", to: "/seller/reviews", icon: Star, end: true },
  { label: "Notifications", to: "/seller/notifications", icon: Bell, end: true },
  { label: "Reports", to: "/seller/reports", icon: FileText, end: false },
];

export default function SellerSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
      {/* LOGO */}
      <div className="px-6 py-5 text-xl font-bold tracking-wide border-b border-slate-700">
        Seller Panel
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
        © 2026 Seller System
      </div>
    </aside>
  );
}
