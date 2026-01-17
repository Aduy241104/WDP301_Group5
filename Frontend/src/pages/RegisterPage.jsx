import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "../schemas/auth.schema";

import RegisterOtpVerify from "../components/RegisterOtpVerify";
import { requestRegisterOtpAPI, registerAPI } from "../services/authServices";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState("info"); // info | otp
    const [serverError, setServerError] = useState("");
    const [draft, setDraft] = useState(null);

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            phone: "",
            gender: "male",
            dateOfBirth: "",
        },
        mode: "onSubmit",
        reValidateMode: "onChange"
    });

    // Step 1: nhập full info nhưng chỉ request OTP bằng email
    const onRequestOtp = async (values) => {
        setServerError("");

        const data = {
            ...values,
            email: values.email.trim(),
            fullName: values.fullName.trim(),
            dateOfBirth: values.dateOfBirth || "",
        };

        try {
            await requestRegisterOtpAPI({ email: data.email }); // backend check email tồn tại ở đây
            setDraft(data);
            setStep("otp");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Không thể gửi OTP.";
            setServerError(message);
        }
    };

    // Step 2: OTP đúng -> gửi full payload + otp để tạo account
    const onVerifyOtp = async (otp) => {
        await registerAPI({
            email: draft.email,
            otp,
            password: draft.password,
            fullName: draft.fullName,
            phone: draft.phone,
            gender: draft.gender,
            dateOfBirth: draft.dateOfBirth,
        });

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login", { replace: true });
    };

    const onResendOtp = async () => {
        await requestRegisterOtpAPI({ email: draft.email });
    };

    const e = form.formState.errors;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow border border-slate-100">
                <div className="p-6 sm:p-8">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        { step === "info" ? "Đăng ký" : "Đăng ký" }
                    </h1>
                    <p className="text-slate-500 mt-1">
                        { step === "info"
                            ? "Nhập thông tin để nhận OTP qua email."
                            : "Xác thực OTP để tạo tài khoản." }
                    </p>

                    { serverError ? (
                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                            { serverError }
                        </div>
                    ) : null }

                    { step === "info" ? (
                        <form onSubmit={ form.handleSubmit(onRequestOtp) } className="mt-6 space-y-4">
                            <Field label="Họ tên" error={ e.fullName?.message }>
                                <input className={ inputCls(!!e.fullName) } placeholder="Test User" { ...form.register("fullName") } />
                            </Field>

                            <Field label="Email" error={ e.email?.message }>
                                <input
                                    className={ inputCls(!!e.email) }
                                    placeholder="duya15914@gmail.com"
                                    autoComplete="email"
                                    { ...form.register("email") }
                                />
                            </Field>

                            <Field label="Mật khẩu" error={ e.password?.message }>
                                <input
                                    type="password"
                                    className={ inputCls(!!e.password) }
                                    placeholder="Anhduy123@"
                                    autoComplete="new-password"
                                    { ...form.register("password") }
                                />
                            </Field>

                            <Field label="Số điện thoại" error={ e.phone?.message }>
                                <input
                                    inputMode="numeric"
                                    className={ inputCls(!!e.phone) }
                                    placeholder="913849813"
                                    { ...form.register("phone") }
                                    onChange={ (ev) => {
                                        const onlyDigits = ev.target.value.replace(/\D/g, "");
                                        form.setValue("phone", onlyDigits, { shouldTouch: true, shouldValidate: true });
                                    } }
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Giới tính" error={ e.gender?.message }>
                                    <select className={ inputCls(!!e.gender) } { ...form.register("gender") }>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </Field>

                                <Field label="Ngày sinh" error={ e.dateOfBirth?.message }>
                                    <input type="date" className={ inputCls(!!e.dateOfBirth) } { ...form.register("dateOfBirth") } />
                                </Field>
                            </div>

                            <button
                                type="submit"
                                disabled={ form.formState.isSubmitting }
                                className="w-full rounded-xl py-2.5 font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                { form.formState.isSubmitting ? "Đang gửi OTP..." : "Đăng ký" }
                            </button>
                        </form>
                    ) : (
                        <div className="mt-6">
                            <RegisterOtpVerify
                                email={ draft?.email }
                                onVerify={ onVerifyOtp }
                                onResend={ onResendOtp }
                                onBack={ () => setStep("info") }
                            />
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
}

function inputCls(isError) {
    return [
        "mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200",
        isError ? "border-rose-300" : "border-slate-200",
    ].join(" ");
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">{ label }</label>
            { children }
            { error ? <p className="mt-1 text-sm text-rose-600">{ error }</p> : null }
        </div>
    );
}
