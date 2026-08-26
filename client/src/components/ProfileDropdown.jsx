import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, SquarePen, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProfileDropdown() {
    const { userID, email, displayName, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate("/");
    };

    return (
        <div className="relative m-5 mr-10 mt-7.5">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-600">
                    <User size={16} strokeWidth={1.75} />
                </div>

                <span className="max-w-36 truncate font-medium">
                    {displayName || email}
                </span>

                <ChevronDown
                    size={16}
                    strokeWidth={1.75}
                    className={`transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600 shrink-0">
                                <User size={18} strokeWidth={1.75} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {displayName || "User"}
                                </p>

                                <p className="text-xs text-gray-500 truncate">
                                    {email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                navigate(`/users/${userID}`);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <SquarePen size={17} strokeWidth={1.75} />
                            <span>My Boards</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <LogOut size={17} strokeWidth={1.75} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}