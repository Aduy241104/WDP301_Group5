export const buildCreateOrderPayload = ({
    variantIds,
    deliveryAddress,
    systemVoucher,
    shopVouchers,
    paymentMethod = "cod",
}) => {
    const shopCodes = Object.fromEntries(
        Object.entries(shopVouchers || {}).filter(([, code]) => !!code)
    );

    return {
        variantIds,
        deliveryAddress,
        vouchers: {
            systemCode: systemVoucher || "",
            shopCodes,
        },
        paymentMethod,
    };
};
