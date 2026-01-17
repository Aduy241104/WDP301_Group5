import { createContext, useContext, useEffect, useState } from "react";
import { AUTH_LOGOUT_EVENT } from "../utils/authEvents";
import { loginAPI } from "../services/authServices";

const AuthContext = createContext(null);
const LS_KEY = "e-commerce";

function safeParseJSON(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const saved = safeParseJSON(localStorage.getItem(LS_KEY) || "");
        return saved ?? { isAuthenticated: false, token: null, user: null };
    });

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(auth));
    }, [auth]);

    const logout = () => {
        setAuth({ isAuthenticated: false, token: null, user: null });
        localStorage.removeItem(LS_KEY);
    };

    // nghe signal từ axios và logout
    useEffect(() => {
        const handler = () => {
            logout();
            // đá về login cho chắc chắn 
            window.location.href = "/login";
        };

        window.addEventListener(AUTH_LOGOUT_EVENT, handler);
        return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async ({ email, password }) => {
        const data = await loginAPI({ email, password });
        const { accessToken, user } = data;

        const next = { isAuthenticated: true, token: accessToken, user };
        setAuth(next);
        return next;
    };

    return (
        <AuthContext.Provider
            value={ {
                auth,
                isAuthenticated: !!auth?.isAuthenticated,
                token: auth?.token ?? null,
                user: auth?.user ?? null,
                login,
                logout,
                setAuth,
            } }
        >
            { children }
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
    return ctx;
}
