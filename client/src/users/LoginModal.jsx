import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

function LoginModal({ isLogin, setOpenLoginModal, setOpenCreateModal }) {
    const { login, BASE_URL } = useAuth();

    const API_URL = BASE_URL + "/user";

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
            const body = {
                email,
                password,
                displayName,
                createdAt: Temporal.Now.plainDateTimeISO()
            };

            const res = await fetch(API_URL + "/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                throw new Error("Invalid email or password");
            }

            const payload = await res.json();
            login(payload.token);
            setOpenLoginModal(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-base" onClick={() => setOpenLoginModal(false)}>
            <div className="modal-container"
                 onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center px-4 py-10">
                    <div className="w-full max-w-md">
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-6 pt-7 pb-6 text-center border-b border-gray-100">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                        <LogIn size={21} strokeWidth={1.75} />
                                </div>

                                <h1 className="mt-4 text-xl font-semibold text-gray-900">
                                    Log In
                                </h1>

                                <p className="mt-1.5 text-sm text-gray-500">
                                    Log in to continue to your board
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-1.5 text-sm font-medium text-gray-700"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block mb-1.5 text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                    />
                                </div>


                                {error && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5">
                                        <p className="text-sm text-red-600">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 cursor-pointer"
                                >
                                    <span>Log In</span>
                                </button>

                                <div className="pt-1 text-center text-sm text-gray-500">
                                            <span>Don't have an account? </span>
                                            <button
                                                className="font-medium text-gray-800 hover:text-gray-500 transition-colors"
                                                onClick={() => {
                                                    setOpenCreateModal(true);
                                                    setOpenLoginModal(false);
                                                }}
                                            >
                                                Sign up
                                            </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginModal;