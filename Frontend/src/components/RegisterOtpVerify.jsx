import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const otpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, "OTP phải là 6 chữ số."),
});

export default function RegisterOtpVerify({
    email,
    onVerify,   // async (otp) => void
    onResend,   // async () => void
    onBack,     // () => void
}) {
    const [serverError, setServerError] = useState("");
    const [serverSuccess, setServerSuccess] = useState("");

    const form = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
        mode: "onTouched",
    });

    const submit = async ({ otp }) => {
        setServerError("");
        setServerSuccess("");
        try {
            await onVerify(otp);
        } catch (err) {
            setServerError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Xác thực OTP thất bại."
            );
        }
    };

    const resend = async () => {
        setServerError("");
        setServerSuccess("");
        try {
            await onResend?.();
            setServerSuccess("OTP mới đã được gửi lại về email.");
        } catch (err) {
            setServerError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Gửi lại OTP thất bại."
            );
        }
    };

    const otpError = form.formState.errors.otp?.message;
    const loading = form.formState.isSubmitting;

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-slate-900">Xác thực OTP</h2>
                <p className="text-slate-500 mt-1">
                    Nhập OTP 6 số đã gửi tới: <b>{ email }</b>
                </p>
            </div>

            { serverError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                    { serverError }
                </div>
            ) : null }

            { serverSuccess ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 text-sm">
                    { serverSuccess }
                </div>
            ) : null }

            <form onSubmit={ form.handleSubmit(submit) } className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">OTP (6 số)</label>
                    <input
                        inputMode="numeric"
                        maxLength={ 6 }
                        placeholder="631187"
                        className={ [
                            "mt-1 w-full rounded-xl border px-3 py-2 outline-none",
                            "focus:ring-2 focus:ring-slate-200 text-center text-lg tracking-widest",
                            otpError ? "border-rose-300" : "border-slate-200",
                        ].join(" ") }
                        { ...form.register("otp") }
                        onChange={ (e) => {
                            const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
                            form.setValue("otp", onlyDigits, { shouldTouch: true, shouldValidate: true });
                        } }
                    />
                    { otpError ? <p className="mt-1 text-sm text-rose-600">{ otpError }</p> : null }
                </div>

                <button
                    type="submit"
                    disabled={ loading }
                    className="w-full rounded-xl py-2.5 font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    { loading ? "Đang xác thực..." : "Xác thực & Tạo tài khoản" }
                </button>

                <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={ onBack } className="text-slate-600 hover:underline">
                        Quay lại
                    </button>
                    <button type="button" onClick={ resend } className="text-slate-700 font-medium hover:underline">
                        Gửi lại OTP
                    </button>
                </div>
            </form>
        </div>
    );
}
