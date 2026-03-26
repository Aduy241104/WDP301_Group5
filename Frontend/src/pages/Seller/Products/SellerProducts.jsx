import { useState } from "react";
import SellerProductList from "./SellerProductList";
import SellerAddProduct from "./SellerAddProduct";
import SellerUpdateProduct from "./SellerUpdateProduct";
import SellerProductDetail from "./SellerProductDetail";

export default function SellerProducts() {
  const [mode, setMode] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProductId, setEditingProductId] = useState(null);
  const [detailProductId, setDetailProductId] = useState(null);

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
          onView={(productId) => {
            setDetailProductId(productId);
            setMode("detail");
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

      {mode === "detail" && detailProductId && (
        <SellerProductDetail
          productId={detailProductId}
          onBack={() => setMode("list")}
        />
      )}
    </div>
  );
}