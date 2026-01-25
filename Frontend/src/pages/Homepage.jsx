import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { testAPi } from "../services/authServices";

export default function HomePage() {
    const { isAuthenticated, user, logout } = useAuth();

    const testHandle = async () => {
        try {
            const res = await testAPi();

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="p-6 space-y-3">
            <h1 className="text-2xl font-semibold">Home (Public)</h1>

            <div className="text-slate-600">
                { isAuthenticated ? (
                    <>
                        <div>Logged in as: { user?.email || "unknown" }</div>
                        <div>Role: { user?.role || "unknown" }</div>
                    </>
                ) : (
                    <div>Chưa đăng nhập</div>
                ) }
            </div>

            <div className="flex gap-3">
                <Link className="underline" to="/zprofile">
                    Profile (Private)
                </Link>
                <Link className="underline" to="/seller">
                    Seller Dashboard (Seller)
                </Link>
                { !isAuthenticated ? (
                    <Link className="underline" to="/login">
                        Login
                    </Link>
                ) : (
                    <button className="underline" onClick={ logout }>
                        Logout
                    </button>
                ) }
            </div>

            <button onClick={ testHandle }>Test</button>
        </div>
    );
}
