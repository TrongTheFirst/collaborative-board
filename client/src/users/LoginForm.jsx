import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import {useNavigate} from "react-router-dom";



export default function LoginForm({isLogin}) {
    const { login, BASE_URL} = useAuth();

    const API_URL = BASE_URL+"/user";

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if(!isLogin && confirmPassword !== password) {
                throw new Error("Passwords do not match");
            }
            const body = {
                email,
                password,
                displayName,
                createdAt: Temporal.Now.plainDateTimeISO()
            };
            if(!isLogin) body.id = 0;

            const res = await fetch(API_URL+(isLogin ? "/login" : "/register"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const payload = await res.json();
            if (!res.ok) {
                if(isLogin) throw new Error("Invalid email or password");

                throw new Error(payload);
            }

            login(payload.token);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{isLogin ? "Log In" : "Sign Up"}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>

                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
                        Display Name
                    </label>

                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>

                {!isLogin && <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                        Confirm Password
                    </label>

                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                </div>}

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    {isLogin ? "Log In" : "Sign Up"}
                </button>
            </form>
        </div>
    );
}