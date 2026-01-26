import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">404</h1>
            <Link to="/" className="underline">Về trang chủ</Link>
        </div>
    );
}
