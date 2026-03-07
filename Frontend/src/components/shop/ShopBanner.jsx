import { useEffect, useState } from "react";
import { getShopBannerAPI } from "../../services/shopBannerService";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ShopBanner({ shopId }) {
    const [single, setSingle] = useState([]);
    const [slider, setSlider] = useState([]);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                const res = await getShopBannerAPI(shopId);

                setSingle(res.data.single || []);
                setSlider(res.data.slider || []);
            } catch (err) {
                console.error(err);
            }
        };

        if (shopId) fetchBanner();
    }, [shopId]);

    const renderImage = (banner) => {
        const img = (
            <img
                src={ banner.imageUrl }
                alt={ banner.title || "banner" }
                className="w-full h-auto"
            />
        );

        return banner.linkUrl ? (
            <a href={ banner.linkUrl }>{ img }</a>
        ) : (
            img
        );
    };

    return (
        <div className="w-full space-y-6 mt-6 pt-4">

            {/* Slider */ }
            { slider.length > 0 && (
                <div className="w-full rounded-xl overflow-hidden shadow bg-white">

                    <Swiper
                        modules={ [Navigation, Pagination, Autoplay] }
                        navigation
                        pagination={ { clickable: true } }
                        autoplay={ { delay: 4000 } }
                        loop={ slider.length > 1 }
                        className="w-full"
                    >
                        { slider.map((banner) => (
                            <SwiperSlide key={ banner._id }>
                                { renderImage(banner) }
                            </SwiperSlide>
                        )) }
                    </Swiper>

                </div>
            ) }

            {/* Single banners */ }
            { single.map((banner) => (
                <div
                    key={ banner._id }
                    className="w-full rounded-xl overflow-hidden shadow bg-white"
                >
                    { banner.title && (
                        <div className="py-4 mt-5 mb-5 text-center">
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide text-gray-800">
                                { banner.title }
                            </h2>
                        </div>
                    ) }

                    { renderImage(banner) }
                </div>
            )) }
        </div>
    );
}