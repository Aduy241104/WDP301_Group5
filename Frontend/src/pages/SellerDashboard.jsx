import React from "react";
import { Link } from "react-router-dom";

export default function SellerDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Seller Dashboard (Seller only)</h1>
            <p className="text-slate-600 mt-2">Chỉ role seller mới vào được.</p>
         <div className="flex gap-4 mt-6">
                <Link
                    to="/seller/orders"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Order Management
                </Link>
            </div>
        </div>
        
    );
}
