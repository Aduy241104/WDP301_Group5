// components/product/ProductFeedbackSection.jsx
export default function ProductFeedbackSection({ productId }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
                Đánh giá sản phẩm
            </h2>

            {/* Placeholder */ }
            <div className="text-slate-500 text-sm">
                Chưa có đánh giá nào cho sản phẩm này.
            </div>

            {/* Sau này có thể map reviews ở đây */ }
        </div>
    );
}
