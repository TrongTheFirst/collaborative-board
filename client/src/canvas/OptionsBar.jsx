import { Link } from "react-router-dom";
import { LogIn, Link2, Unlink } from "lucide-react";
import { useSession } from "../contexts/SesssionContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import ProfileDropdown from "../components/ProfileDropdown";

function OptionsBar({ setOpenCollabModal, setOpenLoginModal}) {
    const { disconnectFromBoard, sessionConnected } = useSession();
    const { isLoggedIn } = useAuth();

    return (
        <div className="fixed z-10 inset-x-0 top-0 pointer-events-none">
            <div className="flex flex-row items-center justify-end gap-2 pointer-events-auto p-5 pt-7.5 pr-10">
                {!sessionConnected ? (
                    <button
                        type="button"
                        onClick={() => setOpenCollabModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <Link2 size={17} strokeWidth={1.75} />
                        <span>Connect</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={disconnectFromBoard}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <Unlink size={17} strokeWidth={1.75} />
                        <span>Disconnect</span>
                    </button>
                )}

                {!isLoggedIn ?
                    <button
                        type="button"
                        onClick={() => setOpenLoginModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <LogIn size={17} strokeWidth={1.75} />
                        <span>Login</span>
                    </button>
                 : <ProfileDropdown />}
            </div>
        </div>
    );
}

export default OptionsBar;