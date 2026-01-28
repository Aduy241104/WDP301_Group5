// context/ToastContext.jsx
import { createContext, useContext, useCallback, useMemo, useState } from "react";
import CenterToast from "../components/common/CenterToast";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toastState, setToastState] = useState({
        open: false,
        type: "success", // success | error | info
        message: "",
        duration: 2200,
    });

    const show = useCallback((type, message, options = {}) => {
        const duration = options.duration ?? 2200;

        setToastState({
            open: true,
            type,
            message,
            duration,
        });
    }, []);

    const close = useCallback(() => {
        setToastState((t) => ({ ...t, open: false }));
    }, []);

    const api = useMemo(
        () => ({
            toast: {
                show,
                success: (msg, options) => show("success", msg, options),
                error: (msg, options) => show("error", msg, options),
                info: (msg, options) => show("info", msg, options),
            },
        }),
        [show]
    );

    return (
        <ToastContext.Provider value={ api }>
            { children }

            {/* Toast tự quản lý show/hide + timer */ }
            <CenterToast
                open={ toastState.open }
                type={ toastState.type }
                message={ toastState.message }
                duration={ toastState.duration }
                onClose={ close }
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
};
