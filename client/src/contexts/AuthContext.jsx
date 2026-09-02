import {createContext, useCallback, useContext, useState, useEffect} from "react";

const AuthContext = createContext(null);

const BASE_URL = "http://localhost:8080/api"
export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [displayName, setDisplayName] = useState();

    const parsedToken = parseToken(token);

    const email = parsedToken ? parsedToken.email : "";
    const userId = parsedToken ? parsedToken.sub : null;
    parsedToken ? parsedToken.displayName : null;

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