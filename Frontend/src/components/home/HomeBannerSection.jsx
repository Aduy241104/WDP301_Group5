import React, { useEffect, useState } from "react";
// Import Swiper React components và styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import API service (Đảm bảo bạn đã export hàm này ở file service)
import { getAllHomeBannersAPI } from "../../services/bannerService";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function HomeBannerSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API trực tiếp trong component
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await getAllHomeBannersAPI();
        // Giả sử API trả về { banners: [...] }
        setBanners(res.banners || []);
      } catch (error) {
        console.error("Lỗi khi lấy banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // 1. Trạng thái đang tải (Skeleton)
  if (loading) {
    return (
      <section className="mt-4">
        <div className="h-[200px] sm:h-[350px] lg:h-[400px] w-full rounded-3xl bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">
          <span className="text-sm font-medium">Đang tải ưu đãi...</span>
        </div>
      </section>
    );
  }

  // 2. Trạng thái không có dữ liệu
  if (banners.length === 0) {
    return null; // Hoặc hiển thị một banner mặc định (static)
  }

  return (
    <section className="mt-4 group relative">
      <Swiper
        spaceBetween={ 15 }
        slidesPerView={ 1 }
        loop={ banners.length > 1 }
        autoplay={ {
          delay: 4000,
          disableOnInteraction: false,
        } }
        pagination={ {
          clickable: true,
          dynamicBullets: true,
        } }
        navigation={ true }
        modules={ [Autoplay, Pagination, Navigation] }
        className="rounded-3xl border border-slate-100 shadow-sm h-[200px] sm:h-[350px] lg:h-[400px] bg-white"
      >
        { banners.map((banner) => (
          <SwiperSlide key={ banner._id }>
            <a
              href={ banner.linkUrl || "#" }
              className="block w-full h-full relative overflow-hidden"
            >
              <img
                src={ banner.imageUrl }
                alt={ banner.title }
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Overlay tiêu đề */ }
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-10">
                <h3 className="text-white text-lg sm:text-2xl font-bold drop-shadow-md transform transition-all duration-500 translate-y-0 group-hover:-translate-y-2">
                  { banner.title }
                </h3>
                <p className="text-white/80 text-xs sm:text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Nhấn để xem chi tiết
                </p>
              </div>
            </a>
          </SwiperSlide>
        )) }
      </Swiper>

      {/* Tùy chỉnh CSS cho các nút Navigation thông qua class "group" */ }
      <style jsx global>{ `
        .swiper-button-next, .swiper-button-prev {
          color: white !important;
          background: rgba(0, 0, 0, 0.2);
          width: 40px !important;
          height: 40px !important;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 16px !important;
        }
        .group:hover .swiper-button-next,
        .group:hover .swiper-button-prev {
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #77e2f2 !important;
          width: 20px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </section>
  );
}