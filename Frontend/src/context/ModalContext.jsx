import { createContext, useContext, useMemo, useState, useCallback } from "react";
import AppModal from "@/components/common/AppModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
    const [modal, setModal] = useState({
        open: false,
        variant: "info", // info | success | warning | danger
        title: "",
        message: "",
        confirmText: "OK",
        cancelText: "",
        onConfirm: null,
        onCancel: null,
        closeOnBackdrop: true,
    });

    const openModal = useCallback((payload = {}) => {
        setModal((prev) => ({
            ...prev,
            open: true,
            ...payload,
        }));
    }, []);

    const closeModal = useCallback(() => {
        setModal((prev) => ({ ...prev, open: false }));
    }, []);

    const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

    return (
        <ModalContext.Provider value={ value }>
            { children }

            <AppModal
                open={ modal.open }
                variant={ modal.variant }
                title={ modal.title }
                message={ modal.message }
                confirmText={ modal.confirmText }
                cancelText={ modal.cancelText }
                closeOnBackdrop={ modal.closeOnBackdrop }
                onClose={ closeModal }
                onConfirm={ () => {
                    modal.onConfirm?.();
                    closeModal();
                } }
                onCancel={ () => {
                    modal.onCancel?.();
                    closeModal();
                } }
            />
        </ModalContext.Provider>
    );
}

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used within ModalProvider");
    return ctx;
}
