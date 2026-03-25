import mongoose from "mongoose";

export const validateSearchProduct = (req, res, next) => {
    // Đổi req.query thành req.body
    let {
        keyword,
        minPrice,
        maxPrice,
        categoryIds, // Nhận thẳng tên mảng cho chuẩn
        minRating,
        page = 1,
        limit = 12,
        sortBy = "createdAt",
        order = -1
    } = req.body;

    const errors = [];

    // 1. Phân trang kiểu tự động điều chỉnh an toàn
    const parsedPage = Math.max(parseInt(page || "1", 10), 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit || "12", 10), 1), 50);

    // 2. Validate CategoryIds (Mảng)
    let parsedCategoryIds = [];
    if (categoryIds) {
        // Ép về mảng nếu user vô tình truyền 1 string
        const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

        for (const id of ids) {
            const cleanId = String(id).trim();
            if (!mongoose.Types.ObjectId.isValid(cleanId)) {
                errors.push(`CategoryId '${cleanId}' không đúng định dạng ObjectId.`);
            } else {
                parsedCategoryIds.push(cleanId);
            }
        }
    }

    // 3. Validate Rating
    let parsedMinRating;
    if (minRating !== undefined) {
        parsedMinRating = Number(minRating);
        if (isNaN(parsedMinRating) || parsedMinRating < 0 || parsedMinRating > 5) {
            errors.push("minRating phải là số từ 0 đến 5.");
        }
    }

    // 4. Validate Khoảng giá
    let parsedMinPrice, parsedMaxPrice;
    if (minPrice !== undefined) {
        parsedMinPrice = Number(minPrice);
        if (isNaN(parsedMinPrice) || parsedMinPrice < 0) errors.push("minPrice phải >= 0.");
    }
    if (maxPrice !== undefined) {
        parsedMaxPrice = Number(maxPrice);
        if (isNaN(parsedMaxPrice) || parsedMaxPrice < 0) errors.push("maxPrice phải >= 0.");
    }
    if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined) {
        if (parsedMinPrice > parsedMaxPrice) errors.push("minPrice không được lớn hơn maxPrice.");
    }

    // 5. Validate Sort Order
    const parsedOrder = Number(order);
    if (![1, -1].includes(parsedOrder)) {
        errors.push("Order chỉ được nhận giá trị 1 (tăng dần) hoặc -1 (giảm dần).");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Dữ liệu đầu vào không hợp lệ",
            errors
        });
    }

    // Gắn vào req.validatedBody (thay vì query)
    req.validatedBody = {
        keyword: keyword?.trim(),
        minPrice: parsedMinPrice,
        maxPrice: parsedMaxPrice,
        categoryIds: parsedCategoryIds.length > 0 ? parsedCategoryIds : undefined,
        minRating: parsedMinRating,
        page: parsedPage,
        limit: parsedLimit,
        sortBy,
        order: parsedOrder
    };

    next();
};