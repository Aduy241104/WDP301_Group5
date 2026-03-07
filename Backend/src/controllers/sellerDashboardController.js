import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Shop } from "../models/Shop.js";
import { Product } from "../models/Product.js";

export const getTopSellingProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const shop = await Shop.findOne({ ownerId: sellerId });

    const products = await Product.find({
      shopId: shop._id,
      isDeleted: false,
      activeStatus: "active",
    })
      .sort({ totalSale: -1 })
      .limit(5)
      .select("name totalSale images");

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductQuantity = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const shop = await Shop.findOne({ ownerId: sellerId });

    const totalProducts = await Product.countDocuments({
      shopId: shop._id,
      isDeleted: false,
    });

    res.json({ totalProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};