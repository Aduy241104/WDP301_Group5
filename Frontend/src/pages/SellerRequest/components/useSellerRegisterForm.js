import { useMemo, useState } from "react";
import { sellerRegisterSchema } from "../../../schemas/sellerRegister.schema";

const initialForm = {
    shopName: "",
    description: "",
    contactPhone: "",
    taxCode: "",
    province: "",
    district: "",
    ward: "",
    streetAddress: "",
    fullAddress: "",
};

export default function useSellerRegisterForm() {
    const [form, setForm] = useState(initialForm);
    const [cccdFront, setCccdFront] = useState(null);
    const [cccdBack, setCccdBack] = useState(null);
    const [errors, setErrors] = useState({});

    const frontPreview = useMemo(
        () => (cccdFront ? URL.createObjectURL(cccdFront) : ""),
        [cccdFront]
    );
    const backPreview = useMemo(
        () => (cccdBack ? URL.createObjectURL(cccdBack) : ""),
        [cccdBack]
    );

    const clearErrorForField = (name) => {
        setErrors((p) => {
            const next = { ...p };
            // map field name => zod path
            if (name === "province") delete next["shopAddress.province"];
            if (name === "district") delete next["shopAddress.district"];
            if (name === "ward") delete next["shopAddress.ward"];
            if (name === "streetAddress") delete next["shopAddress.streetAddress"];
            if (name === "fullAddress") delete next["shopAddress.fullAddress"];
            delete next[name];
            return next;
        });
    };

    const setField = (name, value) => {
        setForm((p) => ({ ...p, [name]: value }));
        clearErrorForField(name);
    };

    const buildPayload = () => ({
        shopName: form.shopName,
        description: form.description,
        contactPhone: form.contactPhone,
        taxCode: form.taxCode,
        shopAddress: {
            province: form.province,
            district: form.district,
            ward: form.ward,
            streetAddress: form.streetAddress,
            fullAddress: form.fullAddress,
        },
    });

    const validate = () => {
        const raw = buildPayload();
        const result = sellerRegisterSchema.safeParse(raw);

        const nextErrors = {};

        if (!result.success) {
            for (const issue of result.error.issues) {
                const key = issue.path.join(".");
                if (!nextErrors[key]) nextErrors[key] = issue.message;
            }
        }

        if (!cccdFront) nextErrors.cccdFront = "Vui lòng chọn ảnh CCCD mặt trước.";
        if (!cccdBack) nextErrors.cccdBack = "Vui lòng chọn ảnh CCCD mặt sau.";

        setErrors(nextErrors);

        return { ok: Object.keys(nextErrors).length === 0, cleaned: result.success ? result.data : null };
    };

    const reset = () => {
        setForm(initialForm);
        setCccdFront(null);
        setCccdBack(null);
        setErrors({});
    };

    return {
        form,
        setField,
        cccdFront,
        cccdBack,
        setCccdFront,
        setCccdBack,
        frontPreview,
        backPreview,
        errors,
        setErrors,
        validate,
        reset,
        buildPayload, // (nếu cần)
    };
}
