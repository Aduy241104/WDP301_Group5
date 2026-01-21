import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordAPI } from "../../services/authServices"; // chỉnh path đúng project bạn
import { ResetSchema } from "./validateSchema"

function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = useMemo(() => {
        const v = searchParams.get("email");
        return v ? String(v).trim().toLowerCase() : "";
    }, [searchParams]);

    const otp = useMemo(() => {
        const v = searchParams.get("otp");
        return v ? String(v).trim() : "";
    }, [searchParams]);

    const [serverMessage, setServerMessage] = useState("");
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onSubmit",
        reValidateMode: "onChange"
    });

    const newPasswordValue = watch("newPassword");

    const missingLinkParams = !email || !otp;

    const onSubmit = async (values) => {
        setServerError("");
        setServerMessage("");

        if (missingLinkParams) {
            setServerError("Link không hợp lệ hoặc thiếu thông tin (email/otp).");
            return;
        }

        try {
            const data = await resetPasswordAPI({
                email,
                otp,
                newPassword: values.newPassword,
            });

            setServerMessage(
                data?.message || "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại."
            );
            reset();
        } catch (err) {
            setServerError(
                err?.response?.data?.message ||
                err?.message ||
                "Không thể đặt lại mật khẩu, vui lòng thử lại"
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h1 className="text-2xl font-bold text-center text-slate-800">
                    Đặt lại mật khẩu
                </h1>

                <p className="text-sm text-slate-500 text-center mt-2">
                    Nhập mật khẩu mới để hoàn tất quá trình đặt lại
                </p>

                { missingLinkParams && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
                        Link reset không hợp lệ hoặc đã bị thiếu tham số. Vui lòng yêu cầu
                        reset lại.
                        <button
                            type="button"
                            onClick={ () => navigate("/forgot-password") }
                            className="ml-2 text-red-700 underline font-semibold"
                        >
                            Gửi lại yêu cầu
                        </button>
                    </div>
                ) }

                <form onSubmit={ handleSubmit(onSubmit) } className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập mật khẩu mới"
                            disabled={ missingLinkParams }
                            { ...register("newPassword") }
                            className="
                                w-full rounded-xl border border-slate-300 px-3 py-2
                                focus:outline-none focus:ring-2 focus:ring-blue-400
                                disabled:opacity-60 disabled:bg-slate-50
                            "
                        />
                        { errors.newPassword && (
                            <p className="mt-1 text-xs text-red-600">
                                { errors.newPassword.message }
                            </p>
                        ) }
                        {/* optional strength hint */ }
                        { newPasswordValue?.length > 0 && newPasswordValue.length < 6 && (
                            <p className="mt-1 text-xs text-slate-500">
                                Gợi ý: Mật khẩu nên từ 6 ký tự trở lên.
                            </p>
                        ) }
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nhập lại mật khẩu mới
                        </label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu"
                            disabled={ missingLinkParams }
                            { ...register("confirmPassword") }
                            className="
                                w-full rounded-xl border border-slate-300 px-3 py-2
                                focus:outline-none focus:ring-2 focus:ring-blue-400
                                disabled:opacity-60 disabled:bg-slate-50
                            "
                        />
                        { errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">
                                { errors.confirmPassword.message }
                            </p>
                        ) }
                    </div>

                    { serverError && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
                            { serverError }
                        </div>
                    ) }

                    { serverMessage && (
                        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                            { serverMessage }
                        </div>
                    ) }

                    <button
                        type="submit"
                        disabled={ missingLinkParams || isSubmitting }
                        className="
                            w-full rounded-xl bg-blue-500 text-white font-semibold py-2
                            hover:bg-blue-600 transition
                            disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        { isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu" }
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={ () => navigate("/login") }
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Về trang đăng nhập
                    </button>

                    <span className="text-slate-300">•</span>

                    <button
                        type="button"
                        onClick={ () => navigate("/forgot-password") }
                        className="text-sm text-slate-600 hover:underline"
                    >
                        Yêu cầu reset lại
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
