import { useNavigate } from "react-router-dom";

const ProfileSidebar = ({ activeView, setActiveView }) => {
  const navigate = useNavigate();

  return (
    <div className="w-56 bg-white border-r p-4 space-y-2">

      {/* BACK TO HOME */}

      <div
        onClick={() => setActiveView("profile")}
        className={`px-3 py-2 rounded cursor-pointer
          ${activeView === "profile"
            ? "bg-gray-100 font-semibold"
            : "hover:bg-gray-100"}`}
      >
        Tài khoản
      </div>

      <div
        onClick={() => setActiveView("password")}
        className={`px-3 py-2 rounded cursor-pointer
          ${activeView === "password"
            ? "bg-gray-100 font-semibold"
            : "hover:bg-gray-100"}`}
      >
        Mật khẩu
      </div>

      <div className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
        Thông báo
      </div>

      <hr />

      <div
        onClick={() => navigate("/")}
        className="px-3 py-2 mb-4 rounded cursor-pointer text-sm font-medium
                   bg-gray-50 hover:bg-gray-100 text-gray-700"
      >
        ← Về trang chủ
      </div>

    </div>
  );
};

export default ProfileSidebar;
