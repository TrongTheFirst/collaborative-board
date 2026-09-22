import {createContext, useCallback, useContext, useState, useEffect} from "react";
import { useNotif } from "./NotificationContext.jsx";

const AuthContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_URL;
export function AuthProvider({ children }) {
    const { showNotif } = useNotif();
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    const parsedToken = parseToken(token);

    const email = parsedToken ? parsedToken.email : "";
    const userId = parsedToken ? parsedToken.sub : null;
    const displayName = parsedToken ? parsedToken.displayName : null;
    const expiration = parsedToken ? parsedToken.exp : null;

    function login(newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }

    function logout(){
        localStorage.removeItem("token");
        setToken(null);
    }

    function parseToken(token){
        return token ? JSON.parse(atob(token.split(".")[1])) : null;
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                email,
                userId,
                displayName,
                BASE_URL,
                isLoggedIn: !!token,
                login,
                logout,
                expiration
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}