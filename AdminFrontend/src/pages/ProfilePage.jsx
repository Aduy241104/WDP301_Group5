import React from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
    const { user } = useAuth();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold">Profile (Private)</h1>
            <pre className="mt-4 p-4 bg-slate-100 rounded-xl overflow-auto">
                { JSON.stringify(user, null, 2) }
            </pre>
        </div>
    );
}
