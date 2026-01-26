import { useNavigate } from "react-router-dom";

const AddressSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-56 bg-white border-r p-4 space-y-2">
      <div
        onClick={() => navigate("/")}
        className="px-3 py-2 rounded cursor-pointer hover:bg-gray-100"
      >
        ← Trang chủ
      </div>

      <div className="px-3 py-2 rounded bg-gray-100 font-semibold">
        Địa chỉ giao hàng
      </div>

    </div>
  );
};

export default AddressSidebar;
