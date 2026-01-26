import { StatusCodes } from "http-status-codes";
import { Report } from "../models/Report.js";

// View Report List
export const AdminReportListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };
        const status = String(req.query.status ?? "").trim();
        if (status) query.status = status;

        const targetType = String(req.query.targetType ?? "").trim();
        if (targetType) query.targetType = targetType;

        const category = String(req.query.category ?? "").trim();
        if (category) query.category = category;

        const [items, total] = await Promise.all([
            Report.find(query)
                .populate("reporterId", "email fullName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Report.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_REPORT_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// View Report Detail
export const AdminReportDetailController = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findOne({ _id: reportId, isDeleted: false })
            .populate("reporterId", "email fullName avatar")
            .populate("timeline.actorId", "email fullName")
            .lean();

        if (!report) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Report not found" });
        }

        return res.status(StatusCodes.OK).json({
            report,
        });
    } catch (err) {
        console.error("ADMIN_REPORT_DETAIL_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

