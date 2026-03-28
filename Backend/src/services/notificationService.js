import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Order Status Notification
|--------------------------------------------------------------------------
| Dùng khi trạng thái đơn hàng thay đổi
| Ví dụ: created → confirmed → shipped → delivered
*/

export const createOrderStatusNotification = async ({
  userId,
  orderId,
  orderCode,
  status,
  url = "",
  targetRole = "customer",
}) => {
  try {
    const statusMessages = {
      created: `Đơn ${orderCode} vừa được tạo`,
    };

    await Notification.create({
      userId,
      type: "order_status",
      title: "Bạn có đơn hàng mới",
      message:
        statusMessages[status] ||
        `Trạng thái đơn ${orderCode} đã được cập nhật`,

      orderId,
      targetRole,

      data: {
        orderCode,
        status,
        url,
      },
    });
  } catch (err) {
    console.error("CREATE_ORDER_NOTIFICATION_ERROR:", err);
  }
};

/*
|--------------------------------------------------------------------------
| Report Result Notification
|--------------------------------------------------------------------------
| Khi admin xử lý report → gửi thông báo cho user/seller
*/

export const createProductReportNotification = async ({
  userId,
  reportId,
  reportCode,
  productName,
  reason,
  description,
}) => {
  try {
    await Notification.create({
      userId,
      type: "report_result",
      title: "Sản phẩm của bạn bị báo cáo",

      message: `Sản phẩm "${productName}" đã bị người dùng báo cáo`,

      reportId,
      targetRole: "seller",

      data: {
        reportCode,
        targetType: "product",
        targetName: productName,
        reason,
        description,
        url: `/seller/reports/${reportId}`,
      },
    });
  } catch (err) {
    console.error("CREATE_PRODUCT_REPORT_NOTIFICATION_ERROR:", err);
  }
};
/*
|--------------------------------------------------------------------------
| System Notification (Single User)
|--------------------------------------------------------------------------
| Admin gửi thông báo hệ thống cho 1 user cụ thể
*/

export const createSystemNotification = async ({
  userId,
  title,
  message,
  targetRole,
}) => {
  try {
    await Notification.create({
      userId,
      type: "system",
      title,
      message,
      targetRole,
    });
  } catch (err) {
    console.error("CREATE_SYSTEM_NOTIFICATION_ERROR:", err);
  }
};

/*
|--------------------------------------------------------------------------
| System Broadcast Notification
|--------------------------------------------------------------------------
| Gửi thông báo hệ thống cho tất cả user theo role
| Ví dụ: gửi cho tất cả seller
*/

export const createSystemBroadcastNotification = async ({
  title,
  message,
  targetRole,
}) => {
  try {
    const users = await User.find({ role: targetRole }).select("_id");

    if (!users.length) return;

    const notifications = users.map((user) => ({
      userId: user._id,
      type: "system",
      title,
      message,
      targetRole,
      isBroadcast: true,
    }));

    await Notification.insertMany(notifications);
  } catch (err) {
    console.error("SYSTEM_BROADCAST_NOTIFICATION_ERROR:", err);
  }
};

export const createShopReportNotification = async ({
  userId,
  reportId,
  reportCode,
  shopName,
  reason,
  description,
}) => {
  try {
    await Notification.create({
      userId,
      type: "report_result",
      title: "Shop của bạn bị báo cáo",

      message: `Shop đã bị người dùng báo cáo`,

      reportId,
      targetRole: "seller",

      data: {
        reportCode,
        targetType: "shop",
        targetName: shopName,
        reason,
        description,
        url: `/seller/reports/${reportId}`,
      },
    });
  } catch (err) {
    console.error("CREATE_SHOP_REPORT_NOTIFICATION_ERROR:", err);
  }
};
