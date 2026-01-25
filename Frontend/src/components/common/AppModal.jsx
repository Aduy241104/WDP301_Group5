import { useEffect } from "react";
import { X, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const STYLES = {
    info: {
        icon: Info,
        ring: "ring-sky-100",
        iconWrap: "bg-sky-50 text-sky-700 border-sky-100",
        confirm: "bg-sky-600 hover:bg-sky-700",
    },
    success: {
        icon: CheckCircle2,
        ring: "ring-emerald-100",
        iconWrap: "bg-emerald-50 text-emerald-700 border-emerald-100",
        confirm: "bg-emerald-600 hover:bg-emerald-700",
    },
    warning: {
        icon: AlertTriangle,
        ring: "ring-amber-100",
        iconWrap: "bg-amber-50 text-amber-700 border-amber-100",
        confirm: "bg-amber-600 hover:bg-amber-700",
    },
    danger: {
        icon: XCircle,
        ring: "ring-rose-100",
        iconWrap: "bg-rose-50 text-rose-700 border-rose-100",
        confirm: "bg-rose-600 hover:bg-rose-700",
    },
};

export default function AppModal({
    open,
    variant = "info",
    title,
    message,
    confirmText = "OK",
    cancelText = "",
    onConfirm,
    onCancel,
    onClose,
    closeOnBackdrop = true,
}) {
    const cfg = STYLES[variant] || STYLES.info;
    const Icon = cfg.icon;

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000]">
            {/* Backdrop */ }
            <div
                className="absolute inset-0 bg-black/40"
                onClick={ () => {
                    if (closeOnBackdrop) onClose?.();
                } }
            />

            {/* Dialog */ }
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    className={ `w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-100 ring-4 ${cfg.ring} overflow-hidden` }
                    onClick={ (e) => e.stopPropagation() }
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className={ `shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${cfg.iconWrap}` }>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold text-slate-900">{ title }</h3>
                                { message ? (
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                        { message }
                                    </p>
                                ) : null }
                            </div>

                            <button
                                type="button"
                                onClick={ onClose }
                                className="shrink-0 rounded-lg p-2 hover:bg-slate-50 text-slate-500"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            { cancelText ? (
                                <button
                                    type="button"
                                    onClick={ onCancel }
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                                >
                                    { cancelText }
                                </button>
                            ) : null }

                            <button
                                type="button"
                                onClick={ onConfirm }
                                className={ `px-4 py-2 rounded-xl text-white font-semibold ${cfg.confirm}` }
                            >
                                { confirmText }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
