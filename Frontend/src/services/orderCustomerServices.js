import axiosInstance from "../axios/axiosConfig";

export const createOrder = async ({ variantIds = [] }) => {
    const response = await axiosInstance.post("/api/order/create-order", { variantIds });
    return response.data;
}


export const applyShopVoucher = async ({
    shopId,
    voucherCode,
    subTotal,
}) => {
    if (!shopId) throw new Error("Missing shopId");
    if (!voucherCode) throw new Error("Missing voucherCode");

    const response = await axiosInstance.post(
        `/api/order/shops/${shopId}/apply-voucher`,
        {
            voucherCode,
            subTotal,
        }
    );

    return response.data;
};


export const applySystemVoucher = async ({
    voucherCode,
    grandSubTotal,
    shippingFeeTotal,
}) => {
    if (!voucherCode) throw new Error("Missing voucherCode");

    const response = await axiosInstance.post("/api/order/system/apply-voucher", {
        voucherCode,
        grandSubTotal,
        shippingFeeTotal,
    });

    return response.data;
};