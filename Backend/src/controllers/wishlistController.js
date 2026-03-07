import mongoose from "mongoose";
import { User } from "../models/User.js";


// xem wishlist (có phân trang)
export const getWishlist = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = req.user.id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: "wishlist",
        select: "name slug images defaultPrice ratingAvg totalSale shop"
      })
      .lean();

    const wishlist = user?.wishlist || [];

    const total = wishlist.length;

    const paginated = wishlist.slice(skip, skip + limit);

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// thêm wishlist
export const addToWishlist = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = req.user.id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId"
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } }, // tránh duplicate
      { new: true }
    );

    return res.json({
      success: true,
      message: "Added to wishlist"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



// xóa wishlist
export const removeFromWishlist = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = req.user.id;
    const { productId } = req.params;

    await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};