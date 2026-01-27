import { useNavigate } from "react-router-dom";

const ProfileSidebar = ({ activeView, setActiveView }) => {
  const navigate = useNavigate();

  return (
    <div className="w-60 shrink-0 border-r border-slate-100 bg-white">
      <div className="px-3 space-y-1">

        {/* SECTION: ACCOUNT */ }
        <div className="mb-3">
          <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Cài đặt
          </p>

          {/* PROFILE */ }
          <div
            onClick={ () => setActiveView("profile") }
            className={ [
              "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer",
              "transition-all",
              activeView === "profile"
                ? "bg-[rgba(119,226,242,0.18)] text-slate-900 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            ].join(" ") }
          >
            <span
              className={ [
                "h-2 w-2 rounded-full",
                activeView === "profile"
                  ? "bg-[rgb(119,226,242)]"
                  : "bg-slate-300",
              ].join(" ") }
            />
            <span>Tài khoản</span>
          </div>

          {/* PASSWORD */ }
          <div
            onClick={ () => setActiveView("password") }
            className={ [
              "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer",
              "transition-all",
              activeView === "password"
                ? "bg-[rgba(119,226,242,0.18)] text-slate-900 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            ].join(" ") }
          >
            <span
              className={ [
                "h-2 w-2 rounded-full",
                activeView === "password"
                  ? "bg-[rgb(119,226,242)]"
                  : "bg-slate-300",
              ].join(" ") }
            />
            <span>Mật khẩu</span>
          </div>

          <div
            onClick={ () => setActiveView("address") }
            className={ [
              "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer",
              "transition-all",
              activeView === "address"
                ? "bg-[rgba(119,226,242,0.18)] text-slate-900 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            ].join(" ") }
          >
            <span
              className={ [
                "h-2 w-2 rounded-full",
                activeView === "address"
                  ? "bg-[rgb(119,226,242)]"
                  : "bg-slate-300",
              ].join(" ") }
            />
            <span>Quản lý địa chỉ</span>
          </div>

          {/* NOTIFICATION */ }
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer
                           text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span>Thông báo</span>
          </div>
        </div>
        

        <hr className="my-4 border-slate-100" />

        {/* BACK TO HOME */ }
        <div
          onClick={ () => navigate("/") }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer
                       text-sm font-semibold text-slate-700
                       bg-slate-50 hover:bg-slate-100 transition"
        >
          <span className="text-base">←</span>
          <span>Về trang chủ</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
