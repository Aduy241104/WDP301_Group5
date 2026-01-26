import { Shop } from "../models/Shop.js";

export const getPickupAddresses = async (req, res) => {
  const shop = await Shop.findOne({
    ownerId: req.user.id,
    isDeleted: false,
  });

  if (!shop) {
    return res.status(404).json({ message: "Shop not found" });
  }

  res.json(
    shop.shopPickupAddresses.filter((a) => !a.isDeleted)
  );
};
