export default function OrderToast({ order, onClose, onClick }) {
  if (!order) return null;

  const type = order.type || "";
  const title = order.title || "";
  const message = order.message || "";

  const header =
    type.startsWith("order")
      ? "New Order"
      : type.includes("report")
        ? "New Report"
        : "New Notification";

  return (
    <div
      className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-lg p-4 w-[280px] cursor-pointer z-[9999] animate-slide-up"
      onClick={onClick}
    >
      <div className="flex justify-between items-end">
        <div>
          <div className="font-semibold text-sm">
            {header}
          </div>

          <div className="text-xs text-gray-600 mt-1">
            {title ? `${title}: ${message}` : message}
          </div>
        </div>

        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}