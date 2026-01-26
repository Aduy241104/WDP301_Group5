import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchReportDetail } from "../services/adminReportServices";

function StatusPill({ status }) {
    const map = {
        open: { label: "Đang mở", cls: "bg-blue-50 text-blue-700" },
        closed: { label: "Đã đóng", cls: "bg-slate-100 text-slate-700" },
        reopened: { label: "Đã mở lại", cls: "bg-amber-50 text-amber-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[status] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function CategoryPill({ category }) {
    const map = {
        spam: { label: "Spam", cls: "bg-red-50 text-red-700" },
        fake: { label: "Giả mạo", cls: "bg-orange-50 text-orange-700" },
        copyright: { label: "Bản quyền", cls: "bg-purple-50 text-purple-700" },
        scam: { label: "Lừa đảo", cls: "bg-rose-50 text-rose-700" },
        abuse: { label: "Lạm dụng", cls: "bg-pink-50 text-pink-700" },
        other: { label: "Khác", cls: "bg-slate-100 text-slate-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[category] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function TargetTypePill({ targetType }) {
    const map = {
        shop: { label: "Shop", cls: "bg-blue-50 text-blue-700" },
        product: { label: "Sản phẩm", cls: "bg-green-50 text-green-700" },
        user: { label: "Người dùng", cls: "bg-purple-50 text-purple-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[targetType] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function TimelineItem({ item }) {
    const actionMap = {
        created: "Tạo",
        closed: "Đóng",
        reopened: "Mở lại",
        updated_category: "Cập nhật danh mục",
        noted: "Ghi chú",
    };

    return (
        <div className="flex gap-4 pb-4 border-l-2 border-slate-200 pl-4 ml-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 -ml-[9px] mt-2" />
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{actionMap[item.action] || item.action}</span>
                    <span className="text-xs text-slate-500">
                        {new Date(item.at).toLocaleString("vi-VN")}
                    </span>
                </div>
                {item.note && (
                    <div className="text-sm text-slate-600 mt-1">{item.note}</div>
                )}
                {item.actorId && (
                    <div className="text-xs text-slate-500 mt-1">
                        Bởi: {item.actorId?.email || item.actorId?.fullName || "—"}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminReportDetail() {
    const navigate = useNavigate();
    const { reportId } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [report, setReport] = useState(null);

    useEffect(() => {
        loadReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportId]);

    const loadReport = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchReportDetail(reportId);
            setReport(res?.report);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải chi tiết khiếu nại.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-slate-500">Đang tải...</div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="space-y-6">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                    {error || "Không tìm thấy khiếu nại."}
                </div>
                <button
                    onClick={() => navigate("/admin/reports")}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold text-sm"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chi tiết Khiếu nại</h1>
                    <p className="text-slate-500 mt-1">Thông tin chi tiết về khiếu nại</p>
                </div>
                <button
                    onClick={() => navigate("/admin/reports")}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold text-sm"
                >
                    Quay lại
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin khiếu nại</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-500">Trạng thái</label>
                                <div className="mt-1">
                                    <StatusPill status={report.status} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-500">Loại đối tượng</label>
                                <div className="mt-1">
                                    <TargetTypePill targetType={report.targetType} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-500">Danh mục</label>
                                <div className="mt-1">
                                    <CategoryPill category={report.category} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-500">Lý do</label>
                                <div className="mt-1 text-slate-900">{report.reason}</div>
                            </div>

                            {report.description && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-500">Mô tả</label>
                                    <div className="mt-1 text-slate-700 whitespace-pre-wrap">{report.description}</div>
                                </div>
                            )}

                            {report.targetSnapshot && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-500">Thông tin đối tượng</label>
                                    <div className="mt-1 space-y-1">
                                        <div className="text-slate-700">Tên: {report.targetSnapshot.name || "—"}</div>
                                        {report.targetSnapshot.slug && (
                                            <div className="text-slate-700">Slug: {report.targetSnapshot.slug}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {report.images && report.images.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-500">Hình ảnh</label>
                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {report.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Evidence ${idx + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-slate-200"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {report.timeline && report.timeline.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Lịch sử</h2>
                            <div className="space-y-2">
                                {report.timeline.map((item, idx) => (
                                    <TimelineItem key={idx} item={item} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Người báo cáo</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-slate-500">Email</label>
                                <div className="mt-1 text-slate-900">{report.reporterId?.email || "—"}</div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-500">Tên</label>
                                <div className="mt-1 text-slate-900">{report.reporterId?.fullName || "—"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin khác</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-slate-500">Ngày tạo</label>
                                <div className="mt-1 text-slate-700">
                                    {report.createdAt
                                        ? new Date(report.createdAt).toLocaleString("vi-VN")
                                        : "—"}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-500">Cập nhật lần cuối</label>
                                <div className="mt-1 text-slate-700">
                                    {report.updatedAt
                                        ? new Date(report.updatedAt).toLocaleString("vi-VN")
                                        : "—"}
                                </div>
                            </div>
                            {report.adminNote && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-500">Ghi chú Admin</label>
                                    <div className="mt-1 text-slate-700 whitespace-pre-wrap">{report.adminNote}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
