import mongoose from "mongoose";

/**
 * =========================
 * CONFIG
 * =========================
 * Chạy:
 * 1) npm i mongoose
 * 2) set MONGO_URI hoặc sửa default
 * 3) node seed.js
 */
const MONGO_URI ="mongodb://127.0.0.1:27017/StoreOnlineDB";
const { Schema, model } = mongoose;

/**
 * =========================
 * MODELS (gói trong 1 file cho dễ chạy)
 * =========================
 */

// USERS
const UserAddressSchema = new Schema(
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
    },
    { _id: true }
);

const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        fullName: { type: String, required: true, trim: true },
        avatar: { type: String, default: "" },
        phone: { type: String, default: "", index: true },
        gender: { type: String, enum: ["male", "female", "other"], default: "other" },
        dateOfBirth: { type: Date },

        role: { type: String, enum: ["user", "seller", "admin"], default: "user", index: true },
        status: { type: String, enum: ["active", "blocked"], default: "active", index: true },

        addresses: { type: [UserAddressSchema], default: [] },
        wishlist: [{ type: Schema.Types.ObjectId, ref: "Product", index: true }],
    },
    { timestamps: true }
);
const User = model("User", UserSchema);

// sellerRequests
const ShopAddressSchema = new Schema(
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },
    },
    { _id: false }
);

const SellerRequestSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        shopName: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        contactPhone: { type: String, required: true },

        shopAddress: { type: ShopAddressSchema, required: true },

        taxCode: { type: String, default: "" },
        cccdImages: [{ type: String, default: "" }],

        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
        rejectReason: { type: String, default: "" },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
const SellerRequest = model("SellerRequest", SellerRequestSchema);

// shops
const ShopPickupAddressSchema = new Schema(
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },

        isDefault: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
    },
    { _id: true }
);

const ShopSchema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        name: { type: String, required: true, trim: true },
        avatar: { type: String, default: "" },
        description: { type: String, default: "" },

        status: { type: String, enum: ["pending", "approved", "blocked"], default: "pending", index: true },
        isBlockedByAdmin: { type: Boolean, default: false },

        shopAddress: { type: ShopAddressSchema, required: true },

        shopPickupAddresses: { type: [ShopPickupAddressSchema], default: [] },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
const Shop = model("Shop", ShopSchema);

// shopFollowers
const ShopFollowerSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);
ShopFollowerSchema.index({ shopId: 1, userId: 1 }, { unique: true });
const ShopFollower = model("ShopFollower", ShopFollowerSchema);

// brands
const BrandSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        logo: { type: String, default: "" },
        description: { type: String, default: "" },

        isActive: { type: Boolean, default: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
const Brand = model("Brand", BrandSchema);

// categorySchemas
const CategorySchemaSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },

        isActive: { type: Boolean, default: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
const CategorySchemaModel = model("CategorySchema", CategorySchemaSchema);

// shopCategories
const ShopCategorySchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
        name: { type: String, required: true, trim: true },
        productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
    { timestamps: true }
);
ShopCategorySchema.index({ shopId: 1, name: 1 });
const ShopCategory = model("ShopCategory", ShopCategorySchema);

// products
const ProductSchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
        shopCategoryId: { type: Schema.Types.ObjectId, ref: "ShopCategory", required: true, index: true },

        brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
        categorySchemaId: { type: Schema.Types.ObjectId, ref: "CategorySchema", required: true, index: true },

        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true, lowercase: true, index: true },
        description: { type: String, default: "" },
        origin: { type: String, default: "" },
        images: [{ type: String, default: "" }],

        attributes: { type: Map, of: Schema.Types.Mixed, default: {} },

        defaultPrice: { type: Number, required: true, min: 0 },

        ratingAvg: { type: Number, default: 0, min: 0, max: 5 },

        status: { type: String, enum: ["pending", "approved", "rejected", "inactive"], default: "pending", index: true },
        rejectReason: { type: String, default: "" },

        inactiveBy: { type: String, enum: ["admin", "seller"], default: null },
        inactiveReason: { type: String, default: "" },
        inactiveAt: { type: Date },
        inactiveActorId: { type: Schema.Types.ObjectId, ref: "User" },

        publishedAt: { type: Date },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
ProductSchema.index({ shopId: 1, slug: 1 }, { unique: true });
const Product = model("Product", ProductSchema);

// variants
const VariantSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        sku: { type: String, required: true, trim: true, index: true },
        size: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ["active", "inactive"], default: "active", index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
VariantSchema.index({ productId: 1, sku: 1 }, { unique: true });
const Variant = model("Variant", VariantSchema);

// inventories
const InventorySchema = new Schema(
    {
        variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true, unique: true, index: true },
        stock: { type: Number, default: 0, min: 0 },
        threshold: { type: Number, default: 0, min: 0 },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);
const Inventory = model("Inventory", InventorySchema);

// carts
const CartItemSchema = new Schema(
    {
        variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const CartSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        items: { type: [CartItemSchema], default: [] },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);
const Cart = model("Cart", CartSchema);

// orderAddressSnapshots
const ContactSchema = new Schema(
    { name: { type: String, required: true }, phone: { type: String, required: true } },
    { _id: false }
);
const AddressSchema = new Schema(
    {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        streetAddress: { type: String, required: true },
        fullAddress: { type: String, required: true },
    },
    { _id: false }
);
const OrderAddressSnapshotSchema = new Schema(
    {
        orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
        type: { type: String, enum: ["pickup", "delivery"], required: true, index: true },
        contact: { type: ContactSchema, required: true },
        address: { type: AddressSchema, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);
OrderAddressSnapshotSchema.index({ orderId: 1, type: 1 });
const OrderAddressSnapshot = model("OrderAddressSnapshot", OrderAddressSnapshotSchema);

// vouchers
const VoucherSchema = new Schema(
    {
        scope: { type: String, enum: ["system", "shop"], required: true, index: true },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", default: null, index: true },

        code: { type: String, required: true, unique: true, index: true, trim: true },
        name: { type: String, required: true },
        description: { type: String, default: "" },

        discountType: { type: String, enum: ["percent", "fixed"], required: true },
        discountValue: { type: Number, required: true, min: 0 },

        minOrderValue: { type: Number, default: 0, min: 0 },
        maxDiscountValue: { type: Number, default: 0, min: 0 },

        startAt: { type: Date, required: true, index: true },
        endAt: { type: Date, required: true, index: true },

        usageLimitTotal: { type: Number, default: 0, min: 0 },
        usedCount: { type: Number, default: 0, min: 0 },
        usageLimitPerUser: { type: Number, default: 0, min: 0 },

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdByRole: { type: String, enum: ["admin", "seller"], required: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
const Voucher = model("Voucher", VoucherSchema);

// orders
const OrderItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true },
        productName: { type: String, required: true },
        variantLabel: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const VoucherAppliedSchema = new Schema(
    {
        voucherId: { type: Schema.Types.ObjectId, ref: "Voucher" },
        code: { type: String, trim: true },
        scope: { type: String, enum: ["system", "shop"], required: true },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", default: null },
        discountType: { type: String, enum: ["percent", "fixed"], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minOrderValue: { type: Number, default: 0, min: 0 },
        maxDiscountValue: { type: Number, default: 0, min: 0 },
        appliedDiscountAmount: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const StatusHistorySchema = new Schema(
    {
        status: { type: String, enum: ["created", "confirmed", "shipped", "delivered", "cancelled"], required: true },
        changedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const OrderSchema = new Schema(
    {
        orderCode: { type: String, required: true, unique: true, index: true },

        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },

        pickupAddressSnapshotId: { type: Schema.Types.ObjectId, ref: "OrderAddressSnapshot", required: true },
        deliveryAddressSnapshotId: { type: Schema.Types.ObjectId, ref: "OrderAddressSnapshot", required: true },

        items: { type: [OrderItemSchema], required: true, default: [] },

        subtotal: { type: Number, required: true, min: 0 },
        shippingFee: { type: Number, default: 0, min: 0 },

        voucher: { type: VoucherAppliedSchema, default: null },

        totalAmount: { type: Number, required: true, min: 0 },

        paymentMethod: { type: String, default: "" },
        paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid", index: true },

        orderStatus: { type: String, enum: ["created", "confirmed", "shipped", "delivered", "cancelled"], default: "created", index: true },
        trackingCode: { type: String, default: "" },

        statusHistory: { type: [StatusHistorySchema], default: [] },

        deliveredAt: { type: Date },
        cancelledAt: { type: Date },
    },
    { timestamps: true }
);
const Order = model("Order", OrderSchema);

// reviews
const SellerReplySchema = new Schema(
    {
        shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
        message: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ReviewSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },

        sellerReply: { type: SellerReplySchema, default: null },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
const Review = model("Review", ReviewSchema);

// notifications
const NotificationDataSchema = new Schema(
    {
        orderCode: { type: String, default: "" },
        status: { type: String, enum: ["created", "confirmed", "shipped", "delivered", "cancelled"] },
    },
    { _id: false }
);

const NotificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        type: { type: String, enum: ["order_status"], required: true, index: true },
        title: { type: String, required: true },
        message: { type: String, required: true },

        orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
        data: { type: NotificationDataSchema, default: null },

        isRead: { type: Boolean, default: false, index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);
const Notification = model("Notification", NotificationSchema);

// voucherUsages
const VoucherUsageSchema = new Schema(
    {
        voucherId: { type: Schema.Types.ObjectId, ref: "Voucher", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
        usedAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);
VoucherUsageSchema.index({ voucherId: 1, userId: 1 }, { unique: true });
const VoucherUsage = model("VoucherUsage", VoucherUsageSchema);

// banners
const BannerSchema = new Schema(
    {
        title: { type: String, required: true },
        imageUrl: { type: String, required: true },

        linkUrl: { type: String, default: "" },
        linkType: { type: String, enum: ["external", "product", "shop", "category", "search"], required: true },
        linkTargetId: { type: Schema.Types.ObjectId, default: null },

        position: { type: String, enum: ["home_top", "home_mid", "home_popup"], required: true, index: true },
        priority: { type: Number, default: 0 },

        startAt: { type: Date, required: true, index: true },
        endAt: { type: Date, required: true, index: true },

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
const Banner = model("Banner", BannerSchema);

// reports
const TargetSnapshotSchema = new Schema(
    {
        name: { type: String, default: "" },
        slug: { type: String, default: "" },
        shopId: { type: Schema.Types.ObjectId, ref: "Shop", default: null },
    },
    { _id: false }
);

const TimelineSchema = new Schema(
    {
        action: { type: String, enum: ["created", "closed", "reopened", "updated_category", "noted"], required: true },
        actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        note: { type: String, default: "" },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const ReportSchema = new Schema(
    {
        reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        targetType: { type: String, enum: ["shop", "product", "user"], required: true, index: true },
        targetId: { type: Schema.Types.ObjectId, required: true, index: true },
        targetSnapshot: { type: TargetSnapshotSchema, default: null },

        category: { type: String, enum: ["spam", "fake", "copyright", "scam", "abuse", "other"], required: true },
        reason: { type: String, required: true },
        description: { type: String, default: "" },
        images: [{ type: String, default: "" }],

        status: { type: String, enum: ["open", "closed", "reopened"], default: "open", index: true },
        adminNote: { type: String, default: "" },

        timeline: { type: [TimelineSchema], default: [] },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);
const Report = model("Report", ReportSchema);

// otpCodes
const OtpCodeSchema = new Schema(
    {
        target: { type: String, required: true, index: true },
        type: { type: String, enum: ["register", "login", "reset_password"], required: true, index: true },
        code: { type: String, required: true },
        expiredAt: { type: Date, required: true, index: true },
        createdAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: { createdAt: false, updatedAt: false } }
);
const OtpCode = model("OtpCode", OtpCodeSchema);

/**
 * =========================
 * SEED DATA
 * =========================
 */
const now = () => new Date();
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

async function clearAll() {
    await Promise.all([
        User.deleteMany({}),
        SellerRequest.deleteMany({}),
        Shop.deleteMany({}),
        ShopFollower.deleteMany({}),
        Brand.deleteMany({}),
        CategorySchemaModel.deleteMany({}),
        ShopCategory.deleteMany({}),
        Product.deleteMany({}),
        Variant.deleteMany({}),
        Inventory.deleteMany({}),
        Cart.deleteMany({}),
        Order.deleteMany({}),
        OrderAddressSnapshot.deleteMany({}),
        Voucher.deleteMany({}),
        VoucherUsage.deleteMany({}),
        Review.deleteMany({}),
        Notification.deleteMany({}),
        Banner.deleteMany({}),
        Report.deleteMany({}),
        OtpCode.deleteMany({}),
    ]);
}

async function seed() {
    // Users
    const admin = await User.create({
        email: "admin@unitrade.dev",
        password: "hashed_admin_password",
        fullName: "Admin UniTrade",
        phone: "0900000000",
        role: "admin",
        status: "active",
        addresses: [
            {
                province: "Hồ Chí Minh",
                district: "Quận 1",
                ward: "Bến Nghé",
                streetAddress: "1 Nguyễn Huệ",
                fullAddress: "1 Nguyễn Huệ, Bến Nghé, Quận 1, Hồ Chí Minh",
                isDefault: true,
            },
        ],
    });

    const seller = await User.create({
        email: "seller@unitrade.dev",
        password: "hashed_seller_password",
        fullName: "Seller Demo",
        phone: "0911111111",
        gender: "male",
        role: "seller",
        status: "active",
    });

    const buyer = await User.create({
        email: "buyer@unitrade.dev",
        password: "hashed_buyer_password",
        fullName: "Buyer Demo",
        phone: "0922222222",
        gender: "female",
        role: "user",
        status: "active",
        addresses: [
            {
                province: "Hồ Chí Minh",
                district: "Quận 7",
                ward: "Tân Phong",
                streetAddress: "10 Nguyễn Hữu Thọ",
                fullAddress: "10 Nguyễn Hữu Thọ, Tân Phong, Quận 7, Hồ Chí Minh",
                isDefault: true,
            },
        ],
    });

    // Seller Request
    const req = await SellerRequest.create({
        userId: seller._id,
        shopName: "Uni Shop Demo",
        description: "Shop demo cho dữ liệu mẫu",
        contactPhone: seller.phone,
        shopAddress: {
            province: "Hồ Chí Minh",
            district: "Quận 3",
            ward: "Phường 7",
            streetAddress: "123 Võ Văn Tần",
            fullAddress: "123 Võ Văn Tần, Phường 7, Quận 3, Hồ Chí Minh",
        },
        taxCode: "0123456789",
        cccdImages: ["https://example.com/cccd-front.jpg", "https://example.com/cccd-back.jpg"],
        status: "approved",
        isDeleted: false,
    });

    // Shop
    const shop = await Shop.create({
        ownerId: seller._id,
        name: req.shopName,
        avatar: "https://example.com/shop-avatar.jpg",
        description: "Shop bán đồ sinh viên",
        status: "approved",
        isBlockedByAdmin: false,
        shopAddress: req.shopAddress,
        shopPickupAddresses: [
            {
                province: req.shopAddress.province,
                district: req.shopAddress.district,
                ward: req.shopAddress.ward,
                streetAddress: req.shopAddress.streetAddress,
                fullAddress: req.shopAddress.fullAddress,
                isDefault: true,
            },
        ],
    });

    // Follow
    await ShopFollower.create({ shopId: shop._id, userId: buyer._id });

    // Brand + Category schema
    const brand = await Brand.create({
        name: "UniBrand",
        logo: "https://example.com/unibrand.png",
        description: "Brand demo",
        isActive: true,
    });

    const catSchema = await CategorySchemaModel.create({
        name: "Thời trang",
        isActive: true,
    });

    // Shop category
    const shopCategory = await ShopCategory.create({
        shopId: shop._id,
        name: "Áo thun",
        productIds: [],
    });

    // Product
    const product = await Product.create({
        shopId: shop._id,
        shopCategoryId: shopCategory._id,
        brandId: brand._id,
        categorySchemaId: catSchema._id,
        name: "Áo thun UniTrade",
        slug: "ao-thun-unitrade",
        description: "Áo thun cotton, mẫu demo",
        origin: "VN",
        images: ["https://example.com/p1.jpg", "https://example.com/p2.jpg"],
        attributes: new Map([
            ["material", "cotton"],
            ["fit", "regular"],
        ]),
        defaultPrice: 99000,
        ratingAvg: 4.8,
        status: "approved",
        publishedAt: now(),
    });

    await ShopCategory.updateOne({ _id: shopCategory._id }, { $addToSet: { productIds: product._id } });

    // Variants
    const vM = await Variant.create({
        productId: product._id,
        sku: "UT-TEE-M",
        size: "M",
        price: 99000,
        status: "active",
    });

    const vL = await Variant.create({
        productId: product._id,
        sku: "UT-TEE-L",
        size: "L",
        price: 109000,
        status: "active",
    });

    // Inventories
    await Inventory.create({ variantId: vM._id, stock: 50, threshold: 5 });
    await Inventory.create({ variantId: vL._id, stock: 30, threshold: 5 });

    // Cart
    await Cart.create({
        userId: buyer._id,
        items: [{ variantId: vM._id, quantity: 2 }],
        updatedAt: now(),
    });

    // Voucher
    const voucher = await Voucher.create({
        scope: "shop",
        shopId: shop._id,
        code: "UNI10",
        name: "Giảm 10%",
        description: "Voucher demo",
        discountType: "percent",
        discountValue: 10,
        minOrderValue: 50000,
        maxDiscountValue: 30000,
        startAt: daysFromNow(-1),
        endAt: daysFromNow(7),
        usageLimitTotal: 1000,
        usedCount: 0,
        usageLimitPerUser: 3,
        createdBy: seller._id,
        createdByRole: "seller",
    });

    // Order + Snapshots
    const pickupSnap = await OrderAddressSnapshot.create({
        type: "pickup",
        contact: { name: shop.name, phone: seller.phone },
        address: {
            province: req.shopAddress.province,
            district: req.shopAddress.district,
            ward: req.shopAddress.ward,
            streetAddress: req.shopAddress.streetAddress,
            fullAddress: req.shopAddress.fullAddress,
        },
        createdAt: now(),
    });

    const deliverySnap = await OrderAddressSnapshot.create({
        type: "delivery",
        contact: { name: buyer.fullName, phone: buyer.phone },
        address: {
            province: "Hồ Chí Minh",
            district: "Quận 7",
            ward: "Tân Phong",
            streetAddress: "10 Nguyễn Hữu Thọ",
            fullAddress: "10 Nguyễn Hữu Thọ, Tân Phong, Quận 7, Hồ Chí Minh",
        },
        createdAt: now(),
    });

    const subtotal = vM.price * 2;
    const shippingFee = 20000;
    const appliedDiscountAmount = Math.min((subtotal * voucher.discountValue) / 100, voucher.maxDiscountValue);
    const totalAmount = subtotal + shippingFee - appliedDiscountAmount;

    const order = await Order.create({
        orderCode: "OD000001",
        userId: buyer._id,
        shop: shop._id,
        pickupAddressSnapshotId: pickupSnap._id,
        deliveryAddressSnapshotId: deliverySnap._id,
        items: [
            {
                productId: product._id,
                variantId: vM._id,
                productName: product.name,
                variantLabel: "Size M",
                price: vM.price,
                quantity: 2,
            },
        ],
        subtotal,
        shippingFee,
        voucher: {
            voucherId: voucher._id,
            code: voucher.code,
            scope: voucher.scope,
            shopId: voucher.shopId,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            minOrderValue: voucher.minOrderValue,
            maxDiscountValue: voucher.maxDiscountValue,
            appliedDiscountAmount,
        },
        totalAmount,
        paymentMethod: "cod",
        paymentStatus: "unpaid",
        orderStatus: "created",
        trackingCode: "",
        statusHistory: [{ status: "created", changedAt: now() }],
    });

    await OrderAddressSnapshot.updateMany(
        { _id: { $in: [pickupSnap._id, deliverySnap._id] } },
        { $set: { orderId: order._id } }
    );

    // Voucher usage
    await VoucherUsage.create({
        voucherId: voucher._id,
        userId: buyer._id,
        orderId: order._id,
        usedAt: now(),
    });

    // Review
    await Review.create({
        productId: product._id,
        userId: buyer._id,
        rating: 5,
        comment: "Áo đẹp, giao nhanh (demo).",
        sellerReply: { shopId: shop._id, message: "Cảm ơn bạn đã ủng hộ!", createdAt: now() },
        isDeleted: false,
    });

    // Notification
    await Notification.create({
        userId: buyer._id,
        type: "order_status",
        title: "Đơn hàng đã được tạo",
        message: `Đơn ${order.orderCode} đang ở trạng thái created`,
        orderId: order._id,
        data: { orderCode: order.orderCode, status: "created" },
        isRead: false,
        isDeleted: false,
        createdAt: now(),
    });

    // Banner
    await Banner.create({
        title: "Sale đầu tuần",
        imageUrl: "https://example.com/banner.jpg",
        linkUrl: "",
        linkType: "shop",
        linkTargetId: shop._id,
        position: "home_top",
        priority: 1,
        startAt: daysFromNow(-1),
        endAt: daysFromNow(7),
        createdBy: admin._id,
        updatedBy: admin._id,
        isDeleted: false,
    });

    // Report
    await Report.create({
        reporterId: buyer._id,
        targetType: "product",
        targetId: product._id,
        targetSnapshot: { name: product.name, slug: product.slug, shopId: shop._id },
        category: "other",
        reason: "Demo report",
        description: "Báo cáo thử cho dữ liệu mẫu",
        images: [],
        status: "open",
        adminNote: "",
        timeline: [
            { action: "created", actorId: buyer._id, note: "User tạo report", at: now() },
            { action: "noted", actorId: admin._id, note: "Admin đã xem", at: now() },
        ],
        isDeleted: false,
    });

    // OTP
    await OtpCode.create({
        target: buyer.email,
        type: "login",
        code: "123456",
        expiredAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: now(),
    });

    // Wishlist
    await User.updateOne({ _id: buyer._id }, { $addToSet: { wishlist: product._id } });

    return { adminId: admin._id, sellerId: seller._id, buyerId: buyer._id, shopId: shop._id, productId: product._id, orderId: order._id };
}

/**
 * =========================
 * RUN
 * =========================
 */
async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected:", MONGO_URI);

        await clearAll();
        console.log("🧹 Cleared old data");

        const ids = await seed();
        console.log("🌱 Seed done. Created IDs:", ids);

        const counts = {
            users: await User.countDocuments(),
            sellerRequests: await SellerRequest.countDocuments(),
            shops: await Shop.countDocuments(),
            shopFollowers: await ShopFollower.countDocuments(),
            brands: await Brand.countDocuments(),
            categorySchemas: await CategorySchemaModel.countDocuments(),
            shopCategories: await ShopCategory.countDocuments(),
            products: await Product.countDocuments(),
            variants: await Variant.countDocuments(),
            inventories: await Inventory.countDocuments(),
            carts: await Cart.countDocuments(),
            orders: await Order.countDocuments(),
            orderAddressSnapshots: await OrderAddressSnapshot.countDocuments(),
            vouchers: await Voucher.countDocuments(),
            voucherUsages: await VoucherUsage.countDocuments(),
            reviews: await Review.countDocuments(),
            notifications: await Notification.countDocuments(),
            banners: await Banner.countDocuments(),
            reports: await Report.countDocuments(),
            otpCodes: await OtpCode.countDocuments(),
        };
        console.table(counts);
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected");
    }
}

main();
