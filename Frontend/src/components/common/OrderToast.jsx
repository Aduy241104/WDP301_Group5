export default function OrderToast({ order, onClose, onClick }) {
  if (!order) return null;

  return (
    <div
      className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-lg p-4 w-[280px] cursor-pointer z-[9999] animate-slide-up"
      onClick={onClick}
    >
      <div className="flex justify-between items-end">
        <div>
          <div className="font-semibold text-sm">
            🛒 New Order
          </div>

          <div className="text-xs text-gray-600 mt-1">
            {order.message}
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