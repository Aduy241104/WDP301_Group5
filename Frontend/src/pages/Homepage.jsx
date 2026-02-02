import { useEffect, useState } from "react";
import HomeBannerSection from "../components/home/HomeBannerSection";
import TopSaleSection from "../components/home/TopSaleSection";
import SuggestSection from "../components/home/SuggestSection";
import { getDiscoverAPI } from "../services/productDiscoveryService";

export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

    const [banners, setBanners] = useState([]);
    const [topSaleProducts, setTopSaleProducts] = useState([]);
    const [suggestProducts, setSuggestProducts] = useState([]);

    useEffect(() => {
        let alive = true;

        const fetchHome = async () => {
            setLoading(true);
            setErrMsg("");

            try {
                const res = await getDiscoverAPI();

                // res = { message, data: { banners, topSaleProducts, suggestProducts } }
                const payload = res?.data || {};

                if (!alive) return;
                setBanners(payload?.banners || []);
                setTopSaleProducts(payload?.topSaleProducts || []);
                setSuggestProducts(payload?.suggestProducts || []);
            } catch (err) {
                if (!alive) return;
                setErrMsg(err?.response?.data?.message || err?.message || "Load home failed");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        fetchHome();
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                { errMsg ? (
                    <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                        { errMsg }
                    </div>
                ) : null }

                <HomeBannerSection banners={ banners } />

                { loading ? (
                    <div className="mt-8 rounded-2xl bg-white border border-slate-100 p-6">
                        <p className="text-slate-600">Đang tải dữ liệu trang chủ...</p>
                    </div>
                ) : (
                    <>
                        <TopSaleSection items={ topSaleProducts } />
                        <SuggestSection items={ suggestProducts } />
                    </>
                ) }
            </div>
        </div>
    );
}
