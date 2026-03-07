import { useState } from "react";
import SellerInventoryList from "./SellerInventoryList";
import InventoryDetail from "./InventoryDetail";

export default function SellerInventory() {
  const [mode, setMode] = useState("list");
  const [pickedId, setPickedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      {mode === "list" && (
        <SellerInventoryList
          key={refreshKey}
          onView={(id) => {
            setPickedId(id);
            setMode("detail");
          }}
        />
      )}

      {mode === "detail" && pickedId && (
        <InventoryDetail
          inventoryId={pickedId}
          onBack={() => setMode("list")}
          onUpdate={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
