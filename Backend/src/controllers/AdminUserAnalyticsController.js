import { User } from "../models/User.js";

export const getMonthlyUserRegistrations = async (req, res) => {
  try {

    const result = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalUsers: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // format lại dữ liệu cho frontend
    const formatted = result.map(item => ({
      year: item._id.year,
      month: item._id.month,
      totalUsers: item.totalUsers
    }));

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error("User analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy dữ liệu đăng ký người dùng"
    });
  }
};