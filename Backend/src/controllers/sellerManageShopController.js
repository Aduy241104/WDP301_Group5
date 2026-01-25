import mongoose from "mongoose";
import { Shop } from "../models/Shop.js";

/**
 * Add shop pickup address
 */
export const addPickupAddress = async (req, res) => {
    try {
        const ownerId = req.user.id; 

        const {
            province,
            district,
            ward,
            streetAddress,
            fullAddress,
            isDefault = false,
        } = req.body;

        if (!province || !district || !ward || !streetAddress || !fullAddress) {
            return res.status(400).json({
                message: "All address fields are required",
            });
        }

        const shop = await Shop.findOne({
            ownerId,
            isDeleted: false,
        });

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
            });
        }

        // 3️⃣ Nếu address mới là default → unset default cũ
        if (isDefault) {
            shop.shopPickupAddresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        // 4️⃣ Thêm address mới
        shop.shopPickupAddresses.push({
            province,
            district,
            ward,
            streetAddress,
            fullAddress,
            isDefault,
        });

        await shop.save();

        return res.status(201).json({
            message: "Pickup address added successfully",
            pickupAddresses: shop.shopPickupAddresses,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const getPickupAddressList = async (req, res) => {
    try {
        const ownerId = req.user.id; 

        const shop = await Shop.findOne({
            ownerId,
            isDeleted: false,
        }).lean();

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
            });
        }

        // Lọc address chưa bị xoá
        const pickupAddresses = shop.shopPickupAddresses.filter(
            (addr) => !addr.isDeleted
        );

        return res.status(200).json({
            message: "Get pickup address list successfully",
            pickupAddresses,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const getPickupAddressDetail = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { pickupAddressId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(pickupAddressId)) {
            return res.status(400).json({
                message: "Invalid pickup address id",
            });
        }

        const shop = await Shop.findOne({
            ownerId,
            isDeleted: false,
            "shopPickupAddresses._id": pickupAddressId,
        }).lean();
        console.log("thong tin cua shop: " + shop);

        if (!shop) {
            return res.status(404).json({
                message: "Pickup address not found",
            });
        }

        const pickupAddress = shop.shopPickupAddresses.find(
            (addr) =>
                addr._id.toString() === pickupAddressId &&
                !addr.isDeleted
        );

        if (!pickupAddress) {
            return res.status(404).json({
                message: "Pickup address not found",
            });
        }

        return res.status(200).json({
            message: "Get pickup address detail successfully",
            pickupAddress,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const updatePickupAddress = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { pickupAddressId } = req.params;

    const {
      province,
      district,
      ward,
      streetAddress,
      fullAddress,
      isDefault,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pickupAddressId)) {
      return res.status(400).json({
        message: "Invalid pickup address id",
      });
    }

    const shop = await Shop.findOne({
      ownerId,
      isDeleted: false,
    });

    if (!shop) {
      return res.status(404).json({
        message: "Shop not found",
      });
    }

    const pickupAddress = shop.shopPickupAddresses.id(pickupAddressId);

    if (!pickupAddress || pickupAddress.isDeleted) {
      return res.status(404).json({
        message: "Pickup address not found",
      });
    }

    // Nếu set default → unset default các address khác
    if (isDefault === true) {
      shop.shopPickupAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
      pickupAddress.isDefault = true;
    }

    // Update fields nếu có
    if (province !== undefined) pickupAddress.province = province;
    if (district !== undefined) pickupAddress.district = district;
    if (ward !== undefined) pickupAddress.ward = ward;
    if (streetAddress !== undefined) pickupAddress.streetAddress = streetAddress;
    if (fullAddress !== undefined) pickupAddress.fullAddress = fullAddress;

    await shop.save();

    return res.status(200).json({
      message: "Pickup address updated successfully",
      pickupAddress,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deletePickupAddress = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { pickupAddressId } = req.params;

        // 1️⃣ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(pickupAddressId)) {
            return res.status(400).json({
                message: "Invalid pickup address id",
            });
        }

        // 2️⃣ Find shop
        const shop = await Shop.findOne({
            ownerId,
            isDeleted: false,
        });

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
            });
        }

        // 3️⃣ Find pickup address
        const pickupAddress = shop.shopPickupAddresses.id(pickupAddressId);

        if (!pickupAddress || pickupAddress.isDeleted) {
            return res.status(404).json({
                message: "Pickup address not found",
            });
        }

        // 4️⃣ Không cho xoá default address
        if (pickupAddress.isDefault) {
            return res.status(400).json({
                message: "Cannot delete default pickup address",
            });
        }

        // 5️⃣ Soft delete
        pickupAddress.isDeleted = true;
        pickupAddress.deletedAt = new Date();

        await shop.save();

        return res.status(200).json({
            message: "Pickup address deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const setDefaultPickupAddress = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { pickupAddressId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pickupAddressId)) {
            return res.status(400).json({
                message: "Invalid pickup address id",
            });
        }

        const shop = await Shop.findOne({
            ownerId,
            isDeleted: false,
        });

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
            });
        }

        const targetAddress = shop.shopPickupAddresses.find(
            (addr) =>
                addr._id.toString() === pickupAddressId &&
                addr.isDeleted === false
        );

        if (!targetAddress) {
            return res.status(404).json({
                message: "Pickup address not found",
            });
        }

        // 1️⃣ unset default cũ
        shop.shopPickupAddresses.forEach((addr) => {
            addr.isDefault = false;
        });

        // 2️⃣ set default mới
        targetAddress.isDefault = true;

        await shop.save();

        return res.status(200).json({
            message: "Set default pickup address successfully",
            pickupAddress: targetAddress,
        });
    } catch (error) {
        console.error("SET_DEFAULT_PICKUP_ADDRESS_ERROR:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};