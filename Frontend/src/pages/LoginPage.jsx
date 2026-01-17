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
        mode: "onTouched",
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-lg rounded-2xl border border-slate-100">
                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-slate-900">Đăng nhập</h1>
                            <p className="text-slate-500 mt-1">Chào mừng bạn quay lại UniTrade.</p>
                        </div>

                        { isAuthenticated ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-emerald-700 font-medium">Bạn đã đăng nhập.</p>
                                <p className="text-emerald-700/80 text-sm mt-1">
                                    { user?.email ? `Email: ${user.email}` : "Bạn có thể quay lại trang chính." }
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={ handleSubmit(onSubmit) } className="space-y-4">
                                { serverError ? (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                                        { serverError }
                                    </div>
                                ) : null }

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email</label>
                                    <input
                                        placeholder="buyer@unitrade.dev"
                                        autoComplete="email"
                                        className={ [
                                            "mt-1 w-full rounded-xl border px-3 py-2 outline-none",
                                            "focus:ring-2 focus:ring-slate-200",
                                            errors.email ? "border-rose-300" : "border-slate-200",
                                        ].join(" ") }
                                        { ...register("email") }
                                    />
                                    { errors.email ? (
                                        <p className="mt-1 text-sm text-rose-600">{ errors.email.message }</p>
                                    ) : null }
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={ showPassword ? "text" : "password" }
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className={ [
                                                "w-full rounded-xl border px-3 py-2 pr-12 outline-none",
                                                "focus:ring-2 focus:ring-slate-200",
                                                errors.password ? "border-rose-300" : "border-slate-200",
                                            ].join(" ") }
                                            { ...register("password") }
                                        />
                                        <button
                                            type="button"
                                            onClick={ () => setShowPassword((v) => !v) }
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100"
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
                                            className="rounded border-slate-300"
                                            { ...register("remember") }
                                        />
                                        Ghi nhớ đăng nhập
                                    </label>

                                    <a
                                        href="/forgot-password"
                                        className="text-sm font-medium text-slate-700 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={ isSubmitting }
                                    className={ [
                                        "w-full rounded-xl py-2.5 font-semibold",
                                        "bg-slate-900 text-white hover:bg-slate-800",
                                        "disabled:opacity-60 disabled:cursor-not-allowed",
                                    ].join(" ") }
                                >
                                    { isSubmitting ? "Đang đăng nhập..." : "Đăng nhập" }
                                </button>

                                <div className="text-sm text-slate-500 text-center">
                                    Chưa có tài khoản?{ " " }
                                    <a className="font-medium text-slate-700 hover:underline" href="/register">
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
