import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createReportAPI,
  getOrderDetailAPI,
} from "../../../services/orderCustomerServices";

function ReportPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [productId, setProductId] = useState(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderDetailAPI(orderId);

        const pid = res?.order?.items?.[0]?.productId;

        if (!pid) {
          console.log("Không tìm thấy productId");
          return;
        }


        setProductId(pid);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      alert("Không tìm thấy productId");
      return;
    }

    try {
      await createReportAPI({
        targetType: "product",
        targetId: productId,
        category: "other",
        reason: reason,
        description: description,
      });

      alert("Gửi khiếu nại thành công");
      navigate("/my-order-list");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "Gửi report thất bại";
      if (status === 409) {
        alert(msg);
        return;
      }
      alert(msg);
    }
  };

  return React.createElement(
    "div",
    { className: "max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow" },

    React.createElement(
      "h1",
      { className: "text-xl font-bold mb-4" },
      "Gửi khiếu nại",
    ),

    React.createElement(
      "form",
      { onSubmit: handleSubmit, className: "space-y-4" },

      React.createElement(
        "div",
        null,
        React.createElement(
          "label",
          { className: "block text-sm font-medium" },
          "Lý do",
        ),
        React.createElement("input", {
          value: reason,
          onChange: (e) => setReason(e.target.value),
          className: "w-full border rounded-lg px-3 py-2",
          placeholder: "Nhập lý do report",
          required: true,
        }),
      ),

      React.createElement(
        "div",
        null,
        React.createElement(
          "label",
          { className: "block text-sm font-medium" },
          "Mô tả",
        ),
        React.createElement("textarea", {
          value: description,
          onChange: (e) => setDescription(e.target.value),
          className: "w-full border rounded-lg px-3 py-2",
          rows: 4,
          placeholder: "Mô tả chi tiết",
        }),
      ),

      React.createElement(
        "button",
        {
          type: "submit",
          className: "bg-red-600 text-white px-4 py-2 rounded-lg",
        },
        "Gửi khiếu nại",
      ),
    ),
  );
}

export default ReportPage;
