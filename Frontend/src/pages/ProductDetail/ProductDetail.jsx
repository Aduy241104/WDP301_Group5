// pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetailAPI } from "../../services/productDiscoveryService";
import ProductInfo from "./ProductInfo";
import AddToCartSection from "./AddToCartSection";
import ProductFeedbackSection from "./ProductFeedbackSection";

export default function ProductDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await getProductDetailAPI(productId);
                setProduct(data.item);
            } finally {
                setLoading(false);
            }
        })();
    }, [productId]);

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    if (!product) {
        return <div className="p-6 text-center text-red-500">Product not found</div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product info */ }
                    <div className="lg:col-span-2">
                        <ProductInfo product={ product } />
                    </div>

                    {/* Add to cart */ }
                    <div>
                        <AddToCartSection product={ product } />
                    </div>
                </div>

                {/* Feedback */ }
                <ProductFeedbackSection productId={ product._id } />
            </div>
        </div>
    );
}
