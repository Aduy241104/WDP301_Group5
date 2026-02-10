import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";

// ============================================
// USER LIST (with search by keyword)
// ============================================
export const AdminUserListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const keyword = String(req.query.keyword ?? "").trim();
        const role = String(req.query.role ?? "").trim();
        const status = String(req.query.status ?? "").trim();

        const query = {};

        if (role) query.role = role;
        if (status) query.status = status;

        if (keyword) {
            query.$or = [
                { fullName: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
                { phone: { $regex: keyword, $options: "i" } },
            ];
        }

        const [items, total] = await Promise.all([
            User.find(query)
                .select("email fullName phone role status createdAt avatar")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_USER_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// VIEW USER PROFILE
// ============================================
export const AdminUserProfileController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
        }

        // Don't send password to client
        const { password, ...profile } = user;
        return res.status(StatusCodes.OK).json({ user: profile });
    } catch (err) {
        console.error("ADMIN_USER_PROFILE_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// BLOCK USER
// ============================================
export const AdminBlockUserController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
        }

        user.status = "blocked";
        await user.save();

        return res.status(StatusCodes.OK).json({
            message: "User blocked.",
            user: { id: user._id, role: user.role, status: user.status },
        });
    } catch (err) {
        console.error("ADMIN_BLOCK_USER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// UNBLOCK USER
// ============================================
export const AdminUnblockUserController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
        }

        user.status = "active";
        await user.save();

        return res.status(StatusCodes.OK).json({
            message: "User unblocked.",
            user: { id: user._id, role: user.role, status: user.status },
        });
    } catch (err) {
        console.error("ADMIN_UNBLOCK_USER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
