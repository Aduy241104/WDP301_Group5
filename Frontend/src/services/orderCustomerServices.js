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

export const placeOrderAPI = async (data) => {
    const response = await axiosInstance.post("/api/order/place-order", data);
    return response.data;
}

export const getMyOrderListAPI = async (page, limit, status, q = "") => {
    const response = await axiosInstance.get("/api/order/my-orders", {
        params: {
            page,
            limit,
            status,
            q: q.trim() // Thêm tham số tìm kiếm vào đây
        }
    });
    return response.data;
}

export const getOrderDetailAPI = async (orderId) => {
    const response = await axiosInstance.get(`/api/order/order-detail/${orderId}`);
    return response.data;
}

export const cancelOrderAPI = async (orderId) => {
    const response = await axiosInstance.delete(`/api/order/cancel-order/${orderId}`);
    return response.data;
}

export const createReportAPI = async (data) => {
    const response = await axiosInstance.post("/api/report/create-report", data);
    return response.data;
};