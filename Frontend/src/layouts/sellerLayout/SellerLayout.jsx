// layouts/sellerLayout/SellerLayout.jsx (gợi ý tạo mới hoặc chỉnh sửa)
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Header from './Header';   // ← header đã tách ra

export default function SellerLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />     
        </main>
      </div>
    </div>
  );
}