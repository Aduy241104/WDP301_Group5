import { Shop } from "../models/Shop.js";
import { uploadImageBuffer, deleteImageByPublicId } from "../services/cloudinaryService.js";

/**
 * @desc View store information
 * @route GET /store/information
 * @access Seller
 */

export const viewStoreInformation = async (req, res) => {
    return res.status(200).json({
        message: "Get store information successfully",
        data: req.shop,
    });
};

export const updateStoreInformation = async (req, res) => {
    try {
        const shop = req.shop;
        let { name, description, avatar, contactPhone, shopAddress } = req.body;
        // shopAddress may be a JSON string when submitted via multipart/form-data
        if (typeof shopAddress === 'string' && shopAddress) {
            try {
                shopAddress = JSON.parse(shopAddress);
            } catch (_) {
                // leave as string; validation below will catch errors
            }
        }

        // update basic fields
        if (name !== undefined) shop.name = name;
        if (description !== undefined) shop.description = description;
        if (contactPhone !== undefined) shop.contactPhone = contactPhone;

        // avatar can come either as a url in the body or as an uploaded file
        if (req.file) {
            // upload to cloudinary
            const folder = `unitrade/shops`;
            const result = await uploadImageBuffer({
                buffer: req.file.buffer,
                folder,
                publicId: `shop_${shop._id}`,
            });

            // delete old image if it was stored with publicId pattern
            if (shop.avatar && shop.avatar.includes(result.public_id) === false) {
                // try to derive old public id from url if possible
                const match = shop.avatar.match(/unitrade\/shops\/(.+)\./);
                if (match) {
                    try {
                        await deleteImageByPublicId(match[1]);
                    } catch (e) {
                        console.warn("Failed to delete previous shop avatar", e);
                    }
                }
            }

            shop.avatar = result.secure_url;
        } else if (avatar !== undefined) {
            // fallback to explicit url (may be used by tests or manual updates)
            shop.avatar = avatar;
        }

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

        // ❌ KHÔNG reset status
        // shop.status = "pending";

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