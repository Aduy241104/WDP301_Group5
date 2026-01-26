import { Shop } from "../models/Shop.js";

/**
 * @desc View store information
 * @route GET /store/information
 * @access Seller
 */
export const viewStoreInformation = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const shop = await Shop.findOne({
            ownerId: sellerId,
            isDeleted: false,
        }).select(
            "name avatar description status shopAddress createdAt updatedAt"
        );

        if (!shop) {
            return res.status(404).json({
                message: "Store not found",
            });
        }

        return res.status(200).json({
            message: "Get store information successfully",
            data: shop,
        });
    } catch (error) {
        console.error("View store information error:", error);
        return res.status(500).json({
            message: "Failed to retrieve store information",
        });
    }
};

export const updateStoreInformation = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { name, description, avatar, shopAddress } = req.body;

        const shop = await Shop.findOne({
            ownerId: sellerId,
            isDeleted: false,
        });

        if (!shop) {
            return res.status(404).json({
                message: "Store not found",
            });
        }

        // Update basic info
        if (name !== undefined) shop.name = name;
        if (description !== undefined) shop.description = description;
        if (avatar !== undefined) shop.avatar = avatar;

        // Update shop address (full replace)
        if (shopAddress) {
            const { province, district, ward, streetAddress, fullAddress } = shopAddress;

            if (!province || !district || !ward || !streetAddress || !fullAddress) {
                return res.status(400).json({
                    message: "Invalid shop address data",
                });
            }

            shop.shopAddress = {
                province,
                district,
                ward,
                streetAddress,
                fullAddress,
            };
        }

        // Optional: reset status to pending if info changed
        shop.status = "pending";

        await shop.save();

        return res.status(200).json({
            message: "Store information updated successfully",
            data: shop,
        });
    } catch (error) {
        console.error("Update store information error:", error);
        return res.status(500).json({
            message: "Failed to update store information",
        });
    }
};
