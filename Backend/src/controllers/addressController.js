import { User } from "../models/User.js";

/**
 * GET /api/profile/addresses
 * View address list
 */
export const viewAddressList = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("addresses");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "View address list successfully",
            data: user.addresses
        });

    } catch (error) {
        console.error("VIEW_ADDRESS_LIST_ERROR:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            province,
            district,
            ward,
            streetAddress,
            isDefault = false
        } = req.body;

        // 1. Validate input
        if (!province || !district || !ward || !streetAddress) {
            return res.status(400).json({
                message: "All address fields are required"
            });
        }

        // 2. Build full address
        const fullAddress = `${streetAddress}, ${ward}, ${district}, ${province}`;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 3. Nếu set default → bỏ default các address khác
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // 4. Push new address
        user.addresses.push({
            province,
            district,
            ward,
            streetAddress,
            fullAddress,
            isDefault
        });

        await user.save();

        return res.status(201).json({
            message: "Add address successfully",
            data: user.addresses
        });

    } catch (error) {
        console.error("ADD_ADDRESS_ERROR:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const {
            province,
            district,
            ward,
            streetAddress,
            isDefault = false
        } = req.body;

        // 1. Validate input
        if (!province || !district || !ward || !streetAddress) {
            return res.status(400).json({
                message: "All address fields are required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 2. Find address
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        // 3. Nếu set default → reset các address khác
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // 4. Build fullAddress
        const fullAddress = `${streetAddress}, ${ward}, ${district}, ${province}`;

        // 5. Update fields
        address.province = province;
        address.district = district;
        address.ward = ward;
        address.streetAddress = streetAddress;
        address.fullAddress = fullAddress;
        address.isDefault = isDefault;

        await user.save();

        return res.status(200).json({
            message: "Update address successfully",
            data: user.addresses
        });

    } catch (error) {
        console.error("UPDATE_ADDRESS_ERROR:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};