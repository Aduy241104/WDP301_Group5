import multer from "multer";

const storage = multer.memoryStorage();

export const uploadMemory = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB/file 
    fileFilter: (req, file, cb) => {
        const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
        if (!ok) return cb(new Error("Only jpg/png/webp are allowed"));
        cb(null, true);
    },
});
