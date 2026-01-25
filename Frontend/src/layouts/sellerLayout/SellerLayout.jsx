
import { Outlet } from "react-router-dom";
import SellerSidebar from "../../components/seller/SellerSidebar";

export default function SellerLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <SellerSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}