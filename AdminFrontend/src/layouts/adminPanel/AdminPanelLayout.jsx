import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminPanelLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />

            <div className="flex-1 min-w-0 flex flex-col">
                <AdminTopbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-6xl p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

