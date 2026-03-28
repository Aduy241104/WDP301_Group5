import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createReportAPI } from "../services/reportService"; // đổi path theo dự án bạn

export default function ReportShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState("spam");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do");
      return;
    }

    try {
      await createReportAPI({
        targetType: "shop", // 🔥 khác product
        targetId: shopId,
        category,
        reason,
        description,
      });

      alert("✅ Report shop thành công!");
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.message || "❌ Report thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow w-[500px] space-y-4">
        <h2 className="text-xl font-semibold">🚨 Báo cáo shop</h2>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Loại vi phạm</label>
          <select
            className="w-full border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="spam">Spam</option>
            <option value="fake">Giả mạo</option>
            <option value="scam">Lừa đảo</option>
            <option value="abuse">Lạm dụng</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block mb-1 font-medium">Lý do</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Nhập lý do..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Mô tả</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            placeholder="Mô tả chi tiết..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Huỷ
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Gửi report
          </button>
        </div>
      </div>
    </div>
  );
}