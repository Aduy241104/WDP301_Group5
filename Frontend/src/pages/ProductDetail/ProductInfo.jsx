// components/product/ProductInfo.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Package, MapPin, Shirt } from "lucide-react";
import { Heart } from "lucide-react";
import {
    getWishlistAPI,
    addWishlistAPI,
    removeWishlistAPI
} from "../../services/wishlistUserService";
import { userTrackingAPI } from "../../services/userTrackingService";

export default function ProductInfo({ product, currentPrice }) {
    const images = useMemo(() => product?.images ?? [], [product]);
    const [activeImg, setActiveImg] = useState(images[0] || "");
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);

    const handleToggleWishlist = async () => {
        if (loadingWishlist) return;

        try {
            setLoadingWishlist(true);

            if (isWishlisted) {
                await removeWishlistAPI(product._id);

                setIsWishlisted(false);
                setWishlistIds(prev => prev.filter(id => id !== product._id));

            } else {
                await addWishlistAPI(product._id);
                await userTrackingAPI(product._id, "wishlist")
                setIsWishlisted(true);
                setWishlistIds(prev => [...prev, product._id]);
            }
        } catch (error) {
            console.log(error);
            alert("Có lỗi xảy ra");
        } finally {
            setLoadingWishlist(false);
        }
    };

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await getWishlistAPI(1, 1000);
                const ids = res.data.map(item => item._id);

                setWishlistIds(ids);
            } catch (error) {
                console.log(error);
            }
        };
        fetchWishlist();
    }, []);

    useEffect(() => {
        setActiveImg(images[0] || "");
    }, [product?._id, images]);

    useEffect(() => {
        if (!product?._id) return;

        setIsWishlisted(wishlistIds.includes(product._id));
    }, [wishlistIds, product?._id]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden font-sans">
            <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gallery */}
                    <div>
                        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                            <div className="aspect-square w-full">
                                {activeImg ? (
                                    <img
                                        src={activeImg}
                                        alt={product?.name || "product"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No image
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-6 gap-2">
                            {images.map((img, idx) => {
                                const isActive = img === activeImg;

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImg(img)}
                                        className={[
                                            "group relative rounded-xl border overflow-hidden bg-white transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-200",
                                            isActive
                                                ? "border-blue-500 ring-2 ring-blue-200"
                                                : "border-slate-200 hover:border-blue-300",
                                        ].join(" ")}
                                        title="Xem ảnh"
                                    >
                                        <div className="aspect-square w-full">
                                            <img
                                                src={img}
                                                alt=""
                                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                                            />
                                        </div>

                                        {!isActive && (
                                            <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                                {product.name}
                            </h1>
                            <p className="text-slate-500 mt-2 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 text-yellow-700 px-3 py-1 text-sm font-semibold border border-yellow-100">
                                <Star className="w-4 h-4" />
                                {product.ratingAvg}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 text-slate-700 px-3 py-1 text-sm font-semibold border border-slate-100">
                                <Package className="w-4 h-4" />
                                Đã bán {product.totalSale}
                            </span>
                            <span
                                className={[
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold border",
                                    product.inStock
                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                        : "bg-red-50 text-red-600 border-red-100",
                                ].join(" ")}
                            >
                                <span
                                    className={[
                                        "w-2 h-2 rounded-full",
                                        product.inStock ? "bg-blue-500" : "bg-red-500",
                                    ].join(" ")}
                                />
                                {product.inStock ? "Còn hàng" : "Hết hàng"}
                            </span>
                        </div>

                        {/* Price box */}
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                            <div className="text-sm text-slate-500">Giá bán</div>
                            <div className="mt-1 text-3xl font-bold text-blue-600">
                                {currentPrice.toLocaleString()}₫
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                                Giá có thể thay đổi theo phân loại (size/variant)
                            </div>
                        </div>
                        {/* Shop */}
                        <div className="pt-2">
                            <div className="rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                                <img
                                    src={product.shop?.avatar}
                                    alt={product.shop?.name || "shop"}
                                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                />
                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-900 truncate">
                                        {product.shop?.name}
                                    </div>
                                    <div className="text-sm text-slate-500 line-clamp-1">
                                        {product.shop?.description}
                                    </div>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/shop/${product.shopId}`)}
                                        className="rounded-xl border border-blue-200 px-3 py-2 
        text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
                                    >
                                        Xem shop
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleToggleWishlist}
                                        disabled={loadingWishlist}
                                        className="p-2 rounded-full border border-slate-200 
        hover:bg-pink-50 transition"
                                    >
                                        <Heart
                                            className={`w-5 h-5 transition ${isWishlisted
                                                ? "text-red-500 fill-red-500"
                                                : "text-slate-400"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>

                    <div className="py-5 my-4">
                        <div>
                            <h1 className="font-bold text-lg">CHI TIẾT SẢN PHẨM</h1>
                            <div className="">
                                {product.attributes &&
                                    Object.entries(product.attributes).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="grid grid-cols-2 gap-6 py-3 text-sm"
                                        >
                                            {/* Label */}
                                            <div className="text-slate-500">
                                                {key}
                                            </div>

                                            {/* Value */}
                                            <div className="text-slate-900">
                                                {Array.isArray(value) ? value.join(", ") : value}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="my-8">
                            <h1 className="font-bold text-lg">MÔ TẢ SẢN PHẨM</h1>
                            <p className="text-slate-500 mt-2 leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
