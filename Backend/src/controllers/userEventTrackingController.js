import { UserProductEvent } from "../models/UserProductEvent.js";
import { Product } from "../models/Product.js";
import { StatusCodes } from "http-status-codes";


export const createUserProductEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, eventType } = req.query;

        const productDoc = await Product
            .findById(productId)
            .select("categorySchemaId brandId shopId");

        if (!productDoc) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Product not found" });
        }

        const data = {
            userId,
            eventType: eventType,
            productId,
            categorySchemaId: productDoc.categorySchemaId,
            brandId: productDoc.brandId,
            shopId: productDoc.shopId
        }

        await UserProductEvent.create(data);
        res.status(StatusCodes.CREATED).json({ message: "Created user event success" })
    } catch (error) {
        console.log("ERROR IN createUserProductEvent: ", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}