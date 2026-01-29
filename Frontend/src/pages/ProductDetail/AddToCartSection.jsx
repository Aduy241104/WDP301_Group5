// components/product/AddToCartSection.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useModal } from "@/context/ModalContext";
import { ShoppingCart, Zap, Minus, Plus } from "lucide-react";
import { addToCartAPI } from "../../services/cartService";
import { useToast } from "../../context/ToastContext";

export default function AddToCartSection({ product }) {
    const [variant, setVariant] = useState(product.variants.find((v) => v.stock > 0) || null);
    const [quantity, setQuantity] = useState(1);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { openModal } = useModal();
    const { toast } = useToast();

    const stock = variant?.stock ?? 0;
    const maxQty = stock > 0 ? stock : 1;

    useEffect(() => {
        setQuantity((q) => Math.min(Math.max(1, q), maxQty));
    }, [maxQty]);


    const showOutOfStockModal = () => {
        openModal({
            variant: "danger",
            title: "Sản phẩm đã hết hàng",
            message: "Phân loại bạn chọn hiện không còn hàng. Vui lòng chọn phân loại khác.",
            confirmText: "Đã hiểu",
        });
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) return navigate("/login");
        if (!variant || stock <= 0) return showOutOfStockModal();

        try {
            await addToCartAPI({ variantId: variant._id, quantity });
            toast.success("Đã thêm vào giỏ hàng.");
        } catch (error) {
            const msg = error?.response?.data?.message || "Không thể thêm vào giỏ hàng.";
            toast.error(msg);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) return navigate("/login");
        if (!variant || stock <= 0) return showOutOfStockModal();
        showToast("info", "Buy now: bạn có thể chuyển sang trang checkout.");
    };

    const handleQuantityChange = (e) => {
        const raw = e.target.value;

        if (raw === "") {
            setQuantity("");
            return;
        }
        const val = Number(raw);
        if (Number.isNaN(val)) return;
        setQuantity(val);
    };

    const handleQuantityBlur = () => {
        setQuantity((q) => {
            if (q === "" || q < 1) return 1;
            if (q > maxQty) return maxQty;
            return q;
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6 font-sans">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Chọn phân loại</h2>

            {/* Variants */ }
            <div className="flex gap-2 flex-wrap mt-4">
                { product.variants.map((v) => {
                    const active = variant?._id === v._id;
                    const disabled = v.stock === 0;

                    return (
                        <button
                            key={ v._id }
                            type="button"
                            onClick={ () => {
                                if (disabled) return;
                                setVariant(v);
                            } }
                            className={ [
                                "px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                                "tracking-wide",
                                active && !disabled
                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                    : "border-slate-300 text-slate-700",
                                disabled
                                    ? "opacity-50 cursor-not-allowed border-red-300 text-red-500 bg-red-50 hover:bg-red-50"
                                    : "hover:bg-blue-50 hover:border-blue-300",
                            ].join(" ") }
                        >
                            { v.size }
                        </button>
                    );
                }) }
            </div>

            {/* Quantity */ }
            <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900 mb-2">Số lượng</p>

                <div className="inline-flex items-center rounded-xl border border-slate-300 overflow-hidden">
                    <button
                        type="button"
                        onClick={ () => setQuantity((q) => Math.max(1, q - 1)) }
                        className="px-3 py-2 text-slate-600 hover:bg-blue-50 disabled:opacity-40"
                        disabled={ stock <= 0 || quantity <= 1 }
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <input
                        type="number"
                        min={ 1 }
                        max={ maxQty }
                        value={ quantity === "" ? "" : quantity }
                        onChange={ handleQuantityChange }
                        onBlur={ handleQuantityBlur }
                        onKeyDown={ (e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                        } }
                        className="w-16 text-center py-2 outline-none text-sm font-semibold text-slate-900"
                        disabled={ stock <= 0 }
                    />
                    <button
                        type="button"
                        onClick={ () => setQuantity((q) => Math.min(maxQty, q + 1)) }
                        className="px-3 py-2 text-slate-600 hover:bg-blue-50 disabled:opacity-40"
                        disabled={ stock <= 0 || quantity >= maxQty }
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs mt-2">
                    { stock > 0 ? (
                        <span className="text-slate-500">
                            Còn <span className="font-semibold text-slate-700">{ stock }</span> sản phẩm
                        </span>
                    ) : (
                        <span className="text-red-500 font-semibold">Sản phẩm đã hết hàng</span>
                    ) }
                </p>
            </div>

            {/* Actions */ }
            <div className="mt-7 space-y-3">
                <button
                    type="button"
                    onClick={ handleAddToCart }
                    className="w-full inline-flex items-center justify-center gap-2
                                bg-[rgb(119,226,242)]
                                hover:bg-[rgb(79,200,220)]
                                text-slate-900
                                py-3 rounded-lg
                                font-semibold tracking-wide
                                transition-all
                                shadow-md shadow-[rgb(119,226,242)]/40
                              "
                >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ hàng
                </button>

                <button
                    type="button"
                    onClick={ handleBuyNow }
                    className="
                                w-full inline-flex items-center justify-center gap-2
                                border-2 border-[rgb(119,226,242)]
                                text-[rgb(14,165,180)]
                                hover:bg-[rgb(119,226,242)]/20
                                py-3 rounded-lg
                                font-semibold tracking-wide
                                transition-all
                              "
                >
                    <Zap className="w-5 h-5" />
                    Mua ngay
                </button>
            </div>
        </div>
    );
}
