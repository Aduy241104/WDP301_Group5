import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth.schema";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login, isAuthenticated, user } = useAuth();
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: true,
        },
        mode: "onSubmit",
        reValidateMode: "onChange"
    });

    const onSubmit = async (values) => {
        setServerError("");
        try {
            await login({ email: values.email.trim(), password: values.password });
            // nếu bạn dùng react-router: navigate("/")
        } catch (err) {
            const mes = err?.response?.data?.message ?
                "Tài khoản hoặc mật khẩu không đúng" :
                "Đăng nhập thất bại. Vui lòng thử lại.";
            setServerError(mes);
        }
    };

    return (
        <div
            className="min-h-screen bg-white flex items-center justify-center px-4 py-10 bg-no-repeat bg-cover bg-center relative"
            style={ {
                backgroundImage:
                    "url('https://res.cloudinary.com/do5o9r18f/image/upload/v1768999689/ChatGPT_Image_19_44_36_21_thg_1_2026_w65ikv.png')",
            } }
        >
            {/* background accent */ }
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#77E2F2]/35 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#77E2F2]/25 blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,0.08)] overflow-hidden">
                    {/* top accent bar */ }
                    <div className="h-1.5 bg-[#77E2F2]" />

                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#77E2F2]/15 px-3 py-1 text-xs font-semibold text-slate-700">
                                UniTrade
                                <span className="h-1 w-1 rounded-full bg-[#77E2F2]" />
                                Sign in
                            </div>

                            <h1 className="mt-3 text-2xl font-bold text-slate-900">Đăng nhập</h1>
                            <p className="text-slate-500 mt-1">Chào mừng bạn quay lại UniTrade.</p>
                        </div>

                        { isAuthenticated ? (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-emerald-700 font-semibold">Bạn đã đăng nhập.</p>
                                <p className="text-emerald-700/80 text-sm mt-1">
                                    { user?.email ? `Email: ${user.email}` : "Bạn có thể quay lại trang chính." }
                                </p>

                                <button
                                    type="button"
                                    className="mt-4 w-full rounded-xl py-2.5 font-semibold bg-[#77E2F2] text-slate-900 hover:brightness-95 transition"
                                    onClick={ () => (window.location.href = "/") }
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={ handleSubmit(onSubmit) } className="space-y-4">
                                { serverError ? (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                                        { serverError }
                                    </div>
                                ) : null }

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Email</label>
                                    <input
                                        placeholder="buyer@unitrade.dev"
                                        autoComplete="email"
                                        className={ [
                                            "mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none",
                                            "focus:ring-4 focus:ring-[#77E2F2]/25 focus:border-[#77E2F2]",
                                            "placeholder:text-slate-400",
                                            errors.email ? "border-rose-300" : "border-slate-200",
                                        ].join(" ") }
                                        { ...register("email") }
                                    />
                                    { errors.email ? (
                                        <p className="mt-1 text-sm text-rose-600">{ errors.email.message }</p>
                                    ) : null }
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={ showPassword ? "text" : "password" }
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className={ [
                                                "w-full rounded-xl border bg-white px-3 py-2 pr-12 outline-none",
                                                "focus:ring-4 focus:ring-[#77E2F2]/25 focus:border-[#77E2F2]",
                                                "placeholder:text-slate-400",
                                                errors.password ? "border-rose-300" : "border-slate-200",
                                            ].join(" ") }
                                            { ...register("password") }
                                        />
                                        <button
                                            type="button"
                                            onClick={ () => setShowPassword((v) => !v) }
                                            className="
                                                       absolute right-2 top-1/2 -translate-y-1/2
                                                       text-xs font-semibold px-2.5 py-1.5 rounded-lg
                                                       text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                                        >
                                            { showPassword ? "Ẩn" : "Hiện" }
                                        </button>
                                    </div>
                                    { errors.password ? (
                                        <p className="mt-1 text-sm text-rose-600">{ errors.password.message }</p>
                                    ) : null }
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-[#77E2F2] focus:ring-[#77E2F2]/30"
                                            { ...register("remember") }
                                        />
                                        Ghi nhớ đăng nhập
                                    </label>

                                    <a
                                        href="/forgot-password"
                                        className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline-offset-4 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={ isSubmitting }
                                    className={ [
                                        "w-full rounded-xl py-2.5 font-bold",
                                        "bg-[#77E2F2] text-slate-900 hover:brightness-95 transition",
                                        "shadow-[0_10px_22px_rgba(119,226,242,0.35)]",
                                        "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none",
                                    ].join(" ") }
                                >
                                    { isSubmitting ? "Đang đăng nhập..." : "Đăng nhập" }
                                </button>

                                <div className="text-sm text-slate-500 text-center">
                                    Chưa có tài khoản?{ " " }
                                    <a className="font-semibold text-slate-800 hover:underline" href="/register">
                                        Đăng ký
                                    </a>
                                </div>
                            </form>
                        ) }
                    </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 text-center">
                    Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng.
                </p>
            </div>
        </div>

    );
}
