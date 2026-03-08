import { Outlet } from "react-router-dom";
import SellerSidebar from "../../components/SellerSidebar";
import useSellerNotifications from "../../hooks/useSellerNotifications";
import OrderToast from "../../components/common/OrderToast";

export default function SellerLayout() {

  const { popup, close, open } = useSellerNotifications();

  return (
    <div className="flex min-h-screen bg-slate-100">

      <SellerSidebar />

      <main className="flex-1 p-6">
        <Outlet />
      </main>

      {/* popup notification */}
      <OrderToast
        order={popup}
        onClose={close}
        onClick={open}
      />

    </div>
  );
}