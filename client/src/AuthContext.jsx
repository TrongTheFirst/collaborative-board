import {createContext, useCallback, useContext, useState} from "react";

export const AuthContext = createContext(null);

const BASE_URL = "http://localhost:8080/api"
export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    const parsedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;

    const email = parsedToken ? parsedToken.email : "";
    const UUID = parsedToken ? parsedToken.sub : null;


    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };


    return (
        <AuthContext.Provider
            value={{
                token,
                email,
                UUID,
                BASE_URL,
                isLoggedIn: !!token,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}