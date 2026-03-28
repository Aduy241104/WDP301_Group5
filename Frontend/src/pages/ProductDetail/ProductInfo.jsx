// components/product/ProductInfo.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Star, Package, Heart } from "lucide-react";
import {
    addWishlistAPI,
    removeWishlistAPI,
    checkWishlistAPI
} from "../../services/wishlistUserService";
import { userTrackingAPI } from "../../services/userTrackingService";

export default function ProductInfo({ product, currentPrice }) {
    const images = useMemo(() => product?.images ?? [], [product]);
    const [activeImg, setActiveImg] = useState(images[0] || "");
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const { isAuthenticated } = useAuth();

    // Xử lý Toggle Wishlist
    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (loadingWishlist) return;

        try {
            setLoadingWishlist(true);

            if (isWishlisted) {
                await removeWishlistAPI(product._id);
                setIsWishlisted(false);
            } else {
                await addWishlistAPI(product._id);
                // Tracking hành vi người dùng khi thêm vào wishlist
                await userTrackingAPI(product._id, "wishlist");
                setIsWishlisted(true);
            }

            // Sync lại trạng thái từ server để đảm bảo chính xác
            const res = await checkWishlistAPI(product._id);
            setIsWishlisted(res.isInWishlist);

        } catch (error) {
            console.error("Wishlist Error:", error);
            alert("Có lỗi xảy ra khi cập nhật danh sách yêu thích");
        } finally {
            setLoadingWishlist(false);
        }
    };

    // Kiểm tra trạng thái yêu thích khi load sản phẩm
    useEffect(() => {
        if (!product?._id || !isAuthenticated) {
            setIsWishlisted(false);
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await checkWishlistAPI(product._id);
                setIsWishlisted(res.isInWishlist);
            } catch (error) {
                console.log("Check wishlist error:", error);
            }
        };

        checkStatus();
    }, [product?._id, isAuthenticated]);

    useEffect(() => {
        setActiveImg(images[0] || "");
    }, [product?._id, images]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden font-sans">
            <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gallery */ }
                    <div>
                        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                            <div className="aspect-square w-full">
                                { activeImg ? (
                                    <img
                                        src={ activeImg }
                                        alt={ product?.name || "product" }
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No image
                                    </div>
                                ) }
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-6 gap-2">
                            { images.map((img, idx) => {
                                const isActive = img === activeImg;
                                return (
                                    <button
                                        key={ idx }
                                        type="button"
                                        onClick={ () => setActiveImg(img) }
                                        className={ [
                                            "group relative rounded-xl border overflow-hidden bg-white transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                            isActive
                                                ? "border-blue-500 ring-2 ring-blue-200"
                                                : "border-slate-200 hover:border-blue-300",
                                        ].join(" ") }
                                    >
                                        <div className="aspect-square w-full">
                                            <img
                                                src={ img }
                                                alt=""
                                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                    </button>
                                );
                            }) }
                        </div>
                    </div>

                    {/* Info */ }
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                                { product.name }
                            </h1>
                            <p className="text-slate-500 mt-2 leading-relaxed italic">
                                { product.description }
                            </p>
                        </div>

                        {/* Badges */ }
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 text-yellow-700 px-3 py-1 text-sm font-semibold border border-yellow-100">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                { product.ratingAvg }
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 text-slate-700 px-3 py-1 text-sm font-semibold border border-slate-100">
                                <Package className="w-4 h-4" />
                                Đã bán { product.totalSale }
                            </span>

                            <span className={ `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border ${product.inStock ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-red-50 text-red-600 border-red-100"
                                }` }>
                                <span className={ `w-2 h-2 rounded-full ${product.inStock ? "bg-blue-500" : "bg-red-500"}` } />
                                { product.inStock ? "Còn hàng" : "Hết hàng" }
                            </span>
                        </div>

                        {/* Price box */ }
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                            <div className="text-sm text-slate-500 font-medium">Giá bán hiện tại</div>
                            <div className="mt-1 text-3xl font-bold text-blue-600">
                                { currentPrice?.toLocaleString() }₫
                            </div>
                        </div>

                        {/* Shop & Wishlist */ }
                        <div className="pt-2">
                            <div className="rounded-2xl border border-slate-100 p-4 flex items-center gap-3 bg-slate-50/50">
                                <img
                                    src={ product.shop?.avatar || "/default-shop.png" }
                                    alt={ product.shop?.name }
                                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                />
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">
                                        { product.shop?.name }
                                    </div>
                                    <div className="text-sm text-slate-500 truncate">
                                        Ghé thăm cửa hàng
                                    </div>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={ () => navigate(`/shop/${product.shopId}`) }
                                        className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
                                    >
                                        Xem shop
                                    </button>

                                    <button
                                        type="button"
                                        onClick={ handleToggleWishlist }
                                        disabled={ loadingWishlist }
                                        className="p-2.5 rounded-full border border-slate-200 hover:bg-pink-50 transition-colors disabled:opacity-50"
                                    >
                                        <Heart
                                            className={ `w-5 h-5 transition-all ${isWishlisted
                                                ? "text-red-500 fill-red-500 scale-110"
                                                : "text-slate-400"
                                                }` }
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Details */ }
                <div className="mt-10 grid grid-cols-1 gap-8 border-t border-slate-100 pt-8">

                    <div>
                        <div className="space-y-1">
                            <span>
                                <span className="font-bold">Danh mục sản phẩm:</span> { product.category[0].name }
                            </span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            CHI TIẾT SẢN PHẨM
                        </h3>
                        <div className="space-y-1">
                            { product.attributes &&
                                Object.entries(product.attributes).map(([key, value]) => (
                                    <div key={ key } className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0 text-sm">
                                        <div className="text-slate-500 font-medium">{ key }</div>
                                        <div className="text-slate-900 col-span-2 capitalize">
                                            { Array.isArray(value) ? value.join(", ") : value }
                                        </div>
                                    </div>
                                )) }
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            MÔ TẢ SẢN PHẨM
                        </h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                            { product.description }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}