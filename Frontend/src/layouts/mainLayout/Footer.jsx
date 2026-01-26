import React from "react";

export default function Footer() {
    return (
        <footer className="mt-10 border-t border-slate-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-2xl bg-[rgb(119,226,242)] shadow-sm" />
                            <div className="text-lg font-extrabold">
                                Uni<span className="text-[rgb(119,226,242)]">Trade</span>
                            </div>
                        </div>

                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                            Nền tảng marketplace dành cho cộng đồng sinh viên: mua bán nhanh, tiện, minh bạch và an toàn.
                            Hỗ trợ người bán quản lý shop, sản phẩm và đơn hàng dễ dàng.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge text="Thanh toán an toàn" />
                            <Badge text="Đổi trả 7 ngày" />
                            <Badge text="Hỗ trợ 24/7" />
                            <Badge text="Bảo vệ người mua" />
                        </div>
                    </div>

                    <FooterCol
                        title="Về UniTrade"
                        items={ [
                            { label: "Giới thiệu", href: "/about" },
                            { label: "Tuyển dụng", href: "/careers" },
                            { label: "Điều khoản sử dụng", href: "/terms" },
                            { label: "Chính sách bảo mật", href: "/privacy" },
                            { label: "Liên hệ", href: "/contact" },
                        ] }
                    />

                    <FooterCol
                        title="Hỗ trợ khách hàng"
                        items={ [
                            { label: "Trung tâm trợ giúp", href: "/support" },
                            { label: "Hướng dẫn mua hàng", href: "/help/buy" },
                            { label: "Hướng dẫn bán hàng", href: "/help/sell" },
                            { label: "Chính sách đổi trả", href: "/returns" },
                            { label: "Theo dõi đơn hàng", href: "/orders" },
                        ] }
                    />

                    <div>
                        <div className="font-extrabold text-slate-900">Kết nối</div>
                        <p className="mt-2 text-sm text-slate-600">
                            Nhận thông tin ưu đãi và cập nhật tính năng mới mỗi tuần.
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                            <input
                                placeholder="Email của bạn"
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[rgb(119,226,242)]/40"
                            />
                            <button className="shrink-0 rounded-2xl px-4 py-3 bg-[rgb(119,226,242)] font-semibold hover:opacity-90 transition">
                                Đăng ký
                            </button>
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-200 p-4 bg-[rgb(119,226,242)]/15">
                            <div className="text-sm font-bold">Hotline</div>
                            <div className="text-sm text-slate-700 mt-1">1900 0000 (08:00 - 22:00)</div>
                            <div className="text-sm text-slate-700">support@unitrade.vn</div>
                            <div className="text-xs text-slate-500 mt-2">Địa chỉ: TP.HCM (demo)</div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-slate-100 pt-6">
                    <div className="text-sm text-slate-600">© { new Date().getFullYear() } UniTrade. All rights reserved.</div>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <a className="hover:underline text-slate-600" href="/payment">
                            Phương thức thanh toán
                        </a>
                        <span className="text-slate-300">•</span>
                        <a className="hover:underline text-slate-600" href="/shipping">
                            Vận chuyển
                        </a>
                        <span className="text-slate-300">•</span>
                        <a className="hover:underline text-slate-600" href="/rules">
                            Quy định cộng đồng
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, items }) {
    return (
        <div>
            <div className="font-extrabold text-slate-900">{ title }</div>
            <ul className="mt-3 space-y-2">
                { items.map((it) => (
                    <li key={ it.href }>
                        <a className="text-sm text-slate-600 hover:text-slate-900 hover:underline" href={ it.href }>
                            { it.label }
                        </a>
                    </li>
                )) }
            </ul>
        </div>
    );
}

function Badge({ text }) {
    return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            { text }
        </span>
    );
}
