import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";


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

    const userId = req.user.id;
    const { productId } = req.params;

    // ✔ validate id
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId"
      });
    }

    // 🔥 convert sang ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // ✔ check product tồn tại
    const product = await Product.findById(productObjectId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // ✔ add wishlist (không duplicate + đúng kiểu)
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productObjectId } }
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
    // ✔ check auth
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = req.user.id;
    const { productId } = req.params;

    // ✔ validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId"
      });
    }

    // 🔥 convert sang ObjectId (QUAN TRỌNG)
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // ✔ remove wishlist
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { wishlist: productObjectId }
      }
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

// check product có trong wishlist không
export const checkWishlist = async (req, res) => {
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

    // 🔥 FIX QUAN TRỌNG
    const exists = await User.exists({
      _id: userId,
      wishlist: productId // ❗ KHÔNG cần ObjectId
    });

    return res.json({
      success: true,
      isInWishlist: !!exists
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};