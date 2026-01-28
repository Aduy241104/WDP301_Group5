// components/ui/CenterToast.jsx
import { useEffect, useRef } from "react";
import { Check, X, Info } from "lucide-react";

export default function CenterToast({
    open,
    type = "success",
    message = "",
    autoClose = true,
    duration = 2000,
    onClose,
}) {
    const timerRef = useRef(null);
    const shouldAutoClose = type === "error" ? false : autoClose;

    useEffect(() => {
        if (!open) return;

        if (shouldAutoClose) {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => onClose?.(), duration);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [open, message, shouldAutoClose, duration, onClose]);

    if (!open) return null;

    const config =
        type === "success"
            ? {
                Icon: Check,
                title: "Thành công",
                box: "bg-black/75",
                circle: "bg-emerald-500 ring-emerald-300/40",
            }
            : type === "error"
                ? {
                    Icon: X,
                    title: "Thất bại",
                    box: "bg-black/80",
                    circle: "bg-rose-500 ring-rose-300/40",
                }
                : {
                    Icon: Info,
                    title: "Thông báo",
                    box: "bg-black/75",
                    circle: "bg-blue-500 ring-blue-300/40",
                };

    const { Icon, title, box, circle } = config;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Backdrop */ }
            <div
                className="absolute"
                onClick={ onClose }
                aria-hidden="true"
            />

            {/* Toast box */ }
            <div
                role="status"
                className={ [
                    "relative w-full max-w-[420px]",
                    "rounded-2xl",
                    box,
                    "shadow-2xl shadow-black/10",
                    "px-10 py-8",
                    "text-center",
                    "animate-in fade-in zoom-in duration-150",
                ].join(" ") }
            >
                <div
                    className={ [
                        "mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full",
                        circle,
                        "ring-8 shadow-lg shadow-black/30",
                    ].join(" ") }
                >
                    <Icon className="h-9 w-9 text-white stroke-[3]" />
                </div>

                {/* Title + Message */ }
                <p className="text-white text-base font-semibold tracking-tight">{ title }</p>
                <p className="text-white/90 text-base mt-2 leading-relaxed">{ message }</p>

                {/* Action */ }
                { !shouldAutoClose ? (
                    <button
                        type="button"
                        onClick={ onClose }
                        className="
              mt-6 w-full
              inline-flex items-center justify-center
              rounded-xl bg-white/12 px-4 py-2.5
              text-sm font-semibold text-white
              hover:bg-white/18
              transition
            "
                    >
                        Đã hiểu
                    </button>
                ) : null }
            </div>
        </div>
    );
}
