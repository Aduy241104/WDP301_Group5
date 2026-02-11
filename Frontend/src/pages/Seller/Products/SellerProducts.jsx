import { useState } from "react";
import SellerProductList from "./SellerProductList";
import SellerAddProduct from "./SellerAddProduct";
import SellerUpdateProduct from "./SellerUpdateProduct";

export default function SellerProducts() {
  const [mode, setMode] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProductId, setEditingProductId] = useState(null);

  return (
    <div className="space-y-4">
      {mode === "list" && (
        <SellerProductList
          key={refreshKey}
          onAdd={() => setMode("add")}
          onEdit={(productId) => {
            setEditingProductId(productId);
            setMode("edit");
          }}
        />
      )}

      {mode === "add" && (
        <SellerAddProduct
          onBack={() => setMode("list")}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {mode === "edit" && editingProductId && (
        <SellerUpdateProduct
          productId={editingProductId}
          onBack={() => setMode("list")}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
