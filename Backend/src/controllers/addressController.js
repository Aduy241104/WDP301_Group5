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

        let {
            fullName,
            phone,
            province,
            district,
            ward,
            streetAddress,
            isDefault = false
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ FALLBACK từ profile
        if (!fullName) fullName = user.fullName;
        if (!phone) phone = user.phone;

        // ✅ Validate SAU fallback
        if (!fullName || !phone || !province || !district || !ward || !streetAddress) {
            return res.status(400).json({
                message: "Missing required address fields"
            });
        }

        const fullAddress = `${streetAddress}, ${ward}, ${district}, ${province}`;

        // ✅ Xử lý default
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({
            fullName,
            phone,
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
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const {
            fullName,
            phone,
            province,
            district,
            ward,
            streetAddress,
            isDefault
        } = req.body;

        
        if (isDefault === true) {
            user.addresses.forEach(addr => addr.isDefault = false);
            address.isDefault = true;
        }

        if (fullName !== undefined) address.fullName = fullName;
        if (phone !== undefined) address.phone = phone;
        if (province) address.province = province;
        if (district) address.district = district;
        if (ward) address.ward = ward;
        if (streetAddress) address.streetAddress = streetAddress;

        
        if (province || district || ward || streetAddress) {
            address.fullAddress = `${address.streetAddress}, ${address.ward}, ${address.district}, ${address.province}`;
        }

        await user.save();

        return res.status(200).json({
            message: "Update address successfully",
            data: user.addresses
        });

    } catch (error) {
        console.error("UPDATE_ADDRESS_ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};




export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const wasDefault = address.isDefault;

        user.addresses.pull(addressId);

        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        return res.status(200).json({
            message: "Delete address successfully",
            data: user.addresses
        });

    } catch (error) {
        console.error("DELETE_ADDRESS_ERROR:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
