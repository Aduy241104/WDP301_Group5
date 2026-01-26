import React from "react";

export default function HomeBannerSection({ banners = [] }) {
  return (
    <section className="mt-4">
      {banners.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-xs font-semibold">
                UniTrade • Discovery
              </p>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
                Mua bán nội bộ sinh viên — nhanh, gọn, an toàn
              </h1>
              <p className="mt-2 text-slate-500 max-w-xl">
                Khám phá sản phẩm bán chạy, ưu đãi, và gợi ý dành riêng cho bạn.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="px-5 py-3 rounded-2xl bg-[rgb(119,226,242)] text-slate-900 font-bold hover:opacity-90 transition">
                  Khám phá ngay
                </button>
                <button className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition font-semibold">
                  Tìm voucher
                </button>
              </div>
            </div>

            <div className="w-full sm:w-[320px]">
              <div className="rounded-3xl border border-slate-100 bg-sky-50 p-6">
                <div className="text-sm font-semibold text-slate-800">
                  Ưu tiên hôm nay
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>🔥 Top sale cập nhật liên tục</li>
                  <li>⭐ Đánh giá & shop uy tín</li>
                  <li>📦 Mua nhanh, theo dõi đơn dễ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cột trái: Banner LỚN (chiếm 2/3) */}
          {banners[0] && (
            <div className="lg:col-span-2 rounded-3xl overflow-hidden bg-white border shadow-sm h-[300px]">
              <img
                src={
                  banners[0]?.image ||
                  "https://via.placeholder.com/1200x500?text=Banner Lớn"
                }
                alt={banners[0]?.title || "Banner Lớn"}
                className="w-full h-full object-cover"
              />
              <div className="p-4">
                <p className="font-bold text-slate-900 text-lg">
                  {banners[0]?.title || "Banner Lớn"}
                </p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {banners[0]?.subtitle || ""}
                </p>
              </div>
            </div>
          )}

          {/* Cột phải: 2 banner nhỏ xếp dọc */}
          <div className="flex flex-col gap-4">
            {banners.slice(1, 3).map((b, idx) => (
              <div
                key={b?._id || idx}
                className="rounded-3xl overflow-hidden bg-white border shadow-sm h-[140px]"
              >
                <img
                  src={
                    b?.image ||
                    "https://via.placeholder.com/600x300?text=Banner Nhỏ"
                  }
                  alt={b?.title || "Banner Nhỏ"}
                  className="w-full h-full object-cover"
                />
                <div className="p-3">
                  <p className="font-semibold text-slate-800 text-sm">
                    {b?.title || "Banner Nhỏ"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
