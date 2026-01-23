import { StatusCodes } from "http-status-codes";
import { uploadImageBuffer, deleteImageByPublicId } from "../services/cloudinaryService.js";

const pickFolder = (req) => {
    // Bạn có thể giới hạn folder để tránh user gửi bậy
    // Ví dụ: users | shops | products | banners
    const raw = String(req.body.folder ?? "products").trim();
    const allowed = new Set(["users", "shops", "products", "banners", "temp"]);
    return allowed.has(raw) ? `unitrade/${raw}` : "unitrade/products";
};

// POST /api/uploads/image (single)
export const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "File is required (field: file)" });
        }

        const folder = pickFolder(req);

        const result = await uploadImageBuffer({
            buffer: req.file.buffer,
            folder,
        });

        return res.status(StatusCodes.OK).json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        });
    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: err?.message || "Upload failed",
        });
    }
};

// POST /api/uploads/images (multiple)
export const uploadMultipleImages = async (req, res) => {
    try {
        const files = req.files ?? [];
        if (!files.length) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Files are required (field: files)" });
        }

        const folder = pickFolder(req);

        // Upload song song
        const results = await Promise.all(
            files.map((f) => uploadImageBuffer({ buffer: f.buffer, folder }))
        );

        return res.status(StatusCodes.OK).json({
            items: results.map((r) => ({
                url: r.secure_url,
                publicId: r.public_id,
                width: r.width,
                height: r.height,
                format: r.format,
                bytes: r.bytes,
            })),
            count: results.length,
        });
    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: err?.message || "Upload failed",
        });
    }
};

// DELETE /api/uploads/image (body: { publicId })
export const deleteImage = async (req, res) => {
    try {
        const publicId = String(req.body.publicId ?? "").trim();
        if (!publicId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "publicId is required" });
        }

        const result = await deleteImageByPublicId(publicId);

        return res.status(StatusCodes.OK).json({
            message: "Deleted",
            result,
        });
    } catch (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: err?.message || "Delete failed",
        });
    }
};
