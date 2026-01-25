import React from "react";
import { Outlet } from "react-router-dom";
import AdminPanelLayout from "../layouts/adminPanel/AdminPanelLayout";

export default function AdminLayoutRoute() {
    return (
        <AdminPanelLayout>
            <Outlet />
        </AdminPanelLayout>
    );
}
