import { useState } from "react";
import SellerProductList from "./SellerProductList";
import SellerAddProduct from "./SellerAddProduct";

export default function SellerProducts() {
  const [mode, setMode] = useState("list");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      {mode === "list" && (
        <SellerProductList
          key={refreshKey}
          onAdd={() => setMode("add")}
        />
      )}

      {mode === "add" && (
        <SellerAddProduct
          onBack={() => setMode("list")}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
