import { Brand } from "../models/Brand.js";

// CREATE BRAND
export const createBrand = async (req, res) => {
    try {
        const { name, logo, description, categoryId } = req.body;

        const brand = await Brand.create({
            name,
            logo,
            description,
            categoryId
        });

        return res.status(201).json({
            message: "Brand created successfully",
            data: brand
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// GET ALL BRANDS
export const getAllBrands = async (req, res) => {
    try {

        const brands = await Brand.find({
            isDeleted: false
        }).populate("categoryId");

        return res.status(200).json({
            total: brands.length,
            data: brands
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// GET BRAND BY ID
export const getBrandById = async (req, res) => {
    try {

        const { id } = req.params;

        const brand = await Brand.findOne({
            _id: id,
            isDeleted: false
        }).populate("categoryId");

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found"
            });
        }

        return res.status(200).json(brand);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// UPDATE BRAND
export const updateBrand = async (req, res) => {
    try {

        const { id } = req.params;

        const brand = await Brand.findOneAndUpdate(
            {
                _id: id,
                isDeleted: false
            },
            req.body,
            {
                new: true
            }
        );

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found"
            });
        }

        return res.status(200).json({
            message: "Brand updated successfully",
            data: brand
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// DELETE BRAND (SOFT DELETE)
export const deleteBrand = async (req, res) => {
    try {

        const { id } = req.params;

        const brand = await Brand.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: req.user?._id
            },
            { new: true }
        );

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found"
            });
        }

        return res.status(200).json({
            message: "Brand deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};