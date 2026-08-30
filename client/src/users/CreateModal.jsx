import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useBoard } from "../contexts/BoardContext.jsx";

function CreateModal({ setOpenCreateModal, setOpenLoginModal}) {
    const { login, BASE_URL } = useAuth();
    const { getBoard, editBoard} = useBoard();


    const API_URL = BASE_URL + "/user";

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (confirmPassword !== password) {
                throw new Error("Passwords do not match");
            }

            const body = {
                id: 0,
                email,
                password,
                displayName,
                createdAt: Temporal.Now.plainDateTimeISO()
            };

            const res = await fetch(API_URL + "/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const payload = await res.json();

            if (!res.ok) {
                throw new Error(payload);
            }

            login(payload.token);
            setOpenCreateModal(false);
            const board = getBoard();
            if(board != null && board.ownerId === 0){
                editBoard(board, payload.token, payload.userId)
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-base" onClick={() => setOpenCreateModal(false)}>
            <div className="modal-container"
                 onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center px-4 py-10">
                    <div className="w-full max-w-md">
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-6 pt-7 pb-6 text-center border-b border-gray-100">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                    <UserPlus size={21} strokeWidth={1.75} />
                                </div>

                                <h1 className="mt-4 text-xl font-semibold text-gray-900">
                                    Create an Account
                                </h1>

                                <p className="mt-1.5 text-sm text-gray-500">
                                    Create an account to get started
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
                                        htmlFor="displayName"
                                        className="block mb-1.5 text-sm font-medium text-gray-700"
                                    >
                                        Display Name
                                    </label>

                                    <input
                                        id="displayName"
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Enter your display name"
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

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block mb-1.5 text-sm font-medium text-gray-700"
                                    >
                                        Confirm Password
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    className="w-full primary-button"
                                >
                                    <span>Sign Up</span>
                                </button>

                                <div className="pt-1 text-center text-sm text-gray-500">
                                    <span>Already have an account? </span>
                                    <button
                                        className="font-medium text-gray-800 hover:text-gray-500 hover:underline transition-colors"
                                        onClick={() => {
                                            setOpenLoginModal(true);
                                            setOpenCreateModal(false);
                                        }}
                                    >
                                        Login
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

export default CreateModal;