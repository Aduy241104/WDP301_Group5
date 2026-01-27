import { useState, useEffect } from "react";
import useSellerRegisterForm from "./components/useSellerRegisterForm";
import CccdUploadSection from "./components/CccdUploadSection";
import ShopInfoSection from "./components/ShopInfoSection";
import ShopAddressSection from "./components/ShopAddressSection";
import { uploadImagesAPI, uploadSingleImageAPI } from "../../services/uploadService";
import { createSellerRequestAPI, checkSellerRequestAPI } from "../../services/requestSellerService";
import PendingPage from "./components/PendingPage";


export default function SellerRegisterPage() {
    const {
        form,
        setField,
        cccdFront,
        cccdBack,
        setCccdFront,
        setCccdBack,
        frontPreview,
        backPreview,
        errors,
        setErrors,
        validate,
        reset,
    } = useSellerRegisterForm();

    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isRequested, setIsRequested] = useState({});

    const onSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setSuccess(false);

        const { ok, cleaned } = validate();
        if (!ok) {
            setServerError("Vui lòng kiểm tra lại các trường bị lỗi.");
            return;
        }

        setSubmitting(true);
        try {
            // Upload CCCD -> lấy URL
            let cccdUrls = [];

            try {
                const up = await uploadImagesAPI({ files: [cccdFront, cccdBack], folder: "temp" });
                cccdUrls = (up?.items ?? []).map((x) => x.url).filter(Boolean);
            } catch {
                const up1 = await uploadSingleImageAPI({ file: cccdFront, folder: "temp" });
                const up2 = await uploadSingleImageAPI({ file: cccdBack, folder: "temp" });
                cccdUrls = [up1?.url, up2?.url].filter(Boolean);
            }

            if (cccdUrls.length !== 2) throw new Error("Upload ảnh CCCD thất bại.");

            const payload = { ...cleaned, cccdImages: cccdUrls };
            const data = await createSellerRequestAPI(payload);

            setSuccess(true);
            reset();
        } catch (err) {
            setServerError(err?.response?.data?.message || err?.message || "Gửi yêu cầu thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const checkSellerRequest = async () => {
            try {
                const response = await checkSellerRequestAPI();
                setIsRequested(response);

            } catch (error) {
                console.log("ERROR: ", error);
            }
        }

        checkSellerRequest();
    }, []);

    if (isRequested.requestStatus == "approved" || isRequested.requestStatus == "pending" || success) {
        const status = isRequested.requestStatus;
        if (success) {
            status = "pending";
        }
        return (
            <PendingPage status={ status } />
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto w-full max-w-6xl">
                {/* Header */ }
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                            Đăng ký trở thành Seller
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Upload CCCD 2 mặt và điền thông tin shop để gửi yêu cầu duyệt.
                        </p>
                    </div>

                    <div className="text-xs text-slate-500">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                            <span className="h-2 w-2 rounded-full bg-sky-400" />
                            Thời gian duyệt: 1–2 ngày làm việc
                        </span>
                    </div>
                </div>

                {/* Alerts */ }
                { serverError ? (
                    <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                        { serverError }
                    </div>
                ) : null }

                {/* Content */ }
                <form onSubmit={ onSubmit } className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left column: CCCD + tips */ }
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="p-5 sm:p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-slate-900">Xác minh CCCD</h2>
                                    <span className="text-xs text-slate-500">* bắt buộc</span>
                                </div>

                                <CccdUploadSection
                                    cccdFront={ cccdFront }
                                    cccdBack={ cccdBack }
                                    frontPreview={ frontPreview }
                                    backPreview={ backPreview }
                                    errors={ errors }
                                    onPickFront={ (e) => {
                                        setCccdFront(e.target.files?.[0] || null);
                                        setErrors((p) => {
                                            const n = { ...p };
                                            delete n.cccdFront;
                                            return n;
                                        });
                                    } }
                                    onPickBack={ (e) => {
                                        setCccdBack(e.target.files?.[0] || null);
                                        setErrors((p) => {
                                            const n = { ...p };
                                            delete n.cccdBack;
                                            return n;
                                        });
                                    } }
                                />

                                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-medium text-slate-800">Lưu ý để duyệt nhanh</p>
                                    <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">
                                        <li>Ảnh rõ nét, không lóa, không cắt góc.</li>
                                        <li>Đúng CCCD của chủ tài khoản đăng ký.</li>
                                        <li>Thông tin shop trùng khớp địa chỉ.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Sticky submit on desktop */ }
                        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm lg:sticky lg:top-6">
                            <div className="p-5 sm:p-6">
                                <button
                                    type="submit"
                                    disabled={ submitting }
                                    className="w-full rounded-2xl bg-sky-500 text-white py-3 font-semibold shadow-md hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    { submitting ? "Đang gửi..." : "Gửi yêu cầu" }
                                </button>
                                <p className="mt-3 text-xs text-slate-500">
                                    Bằng việc gửi yêu cầu, bạn xác nhận thông tin cung cấp là chính xác.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right column: form */ }
                    <div className="lg:col-span-7 space-y-6">
                        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="p-5 sm:p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-slate-900">Thông tin shop</h2>
                                    <span className="text-xs text-slate-500">Điền đầy đủ để tăng tỉ lệ duyệt</span>
                                </div>

                                <div className="space-y-6">
                                    <ShopInfoSection form={ form } setField={ setField } errors={ errors } />

                                    <div className="h-px bg-slate-100" />

                                    <ShopAddressSection form={ form } setField={ setField } errors={ errors } />
                                </div>
                            </div>
                        </div>

                        {/* Mobile submit (since sticky card is below CCCD on mobile) */ }
                        <div className="lg:hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="p-5 sm:p-6">
                                <button
                                    type="submit"
                                    disabled={ submitting }
                                    className="w-full rounded-2xl bg-sky-500 text-white py-3 font-semibold shadow-md hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    { submitting ? "Đang gửi..." : "Gửi yêu cầu" }
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
