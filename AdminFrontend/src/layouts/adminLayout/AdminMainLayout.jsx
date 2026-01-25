import React from "react";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

export default function AdminMainLayout({ children }) {
    return (
        <div className="min-h-screen bg-white text-slate-800">
            <AdminHeader />
            <main className="mx-auto max-w-7xl px-4 py-6">
                <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 md:p-8">
                    {children}
                </div>
            </main>
            <AdminFooter />
        </div>
    );
}
