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
} from "lucide-react";

const menu = [
  { label: "Dashboard", to: "/seller", icon: LayoutDashboard },
  { label: "Store Information", to: "/seller/store-information", icon: Store },
  { label: "Manage Pickup Address", to: "/seller/pickup-addresses", icon: Store },
  { label: "Categories", to: "/seller/categories", icon: Boxes },
  { label: "Products", to: "/seller/products", icon: Package },
  { label: "Inventory", to: "/seller/inventory", icon: Warehouse },
  { label: "Orders", to: "/seller/orders", icon: ShoppingCart },
  { label: "Returns", to: "/seller/returns", icon: RotateCcw },
  { label: "Reviews", to: "/seller/reviews", icon: Star },
  { label: "Notifications", to: "/seller/notifications", icon: Bell },
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
            to={item.to}
            end={item.to === "/seller"}
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
