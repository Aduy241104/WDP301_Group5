import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-white text-slate-800">
            <Header />

            <main className="mx-auto max-w-7xl px-4 py-6">
                {/* container body hiện đại */ }
                <div className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 md:p-8">
                    { children }
                </div>
            </main>

            <Footer />
        </div>
    );
}
