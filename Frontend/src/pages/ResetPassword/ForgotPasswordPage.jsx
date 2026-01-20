import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestResetPasswordLinkAPI } from "../../services/authServices";
import { ForgotSchema } from "./validateSchema"


function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const parsed = ForgotSchema.safeParse({ email });
        if (!parsed.success) {
            setError(parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ");
            return;
        }

        try {
            setLoading(true);

            const data = await requestResetPasswordLinkAPI({
                email: parsed.data.email,
            });

            setMessage(
                data?.message ||
                "Nếu email tồn tại, một link đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư."
            );
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Có lỗi xảy ra, vui lòng thử lại"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h1 className="text-2xl font-bold text-center text-slate-800">
                    Quên mật khẩu
                </h1>

                <p className="text-sm text-slate-500 text-center mt-2">
                    Nhập email để nhận link đặt lại mật khẩu
                </p>

                <form onSubmit={ handleSubmit } className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={ email }
                            onChange={ (e) => setEmail(e.target.value) }
                            placeholder="example@email.com"
                            className="
                                w-full rounded-xl border border-slate-300 px-3 py-2
                                focus:outline-none focus:ring-2 focus:ring-blue-400
                            "
                        />
                    </div>

                    { error && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
                            { error }
                        </div>
                    ) }

                    { message && (
                        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                            { message }
                        </div>
                    ) }

                    <button
                        type="submit"
                        disabled={ loading }
                        className="
                            w-full rounded-xl bg-blue-500 text-white font-semibold py-2
                            hover:bg-blue-600 transition
                            disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        { loading ? "Đang gửi..." : "Gửi yêu cầu" }
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={ () => navigate("/login") }
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Quay lại đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
