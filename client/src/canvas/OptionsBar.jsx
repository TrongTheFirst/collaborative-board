import { Link } from "react-router-dom";
import { LogIn, Link2, Unlink, UserPlus} from "lucide-react";
import { useSession } from "../contexts/SesssionContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import ProfileDropdown from "../components/ProfileDropdown";

function OptionsBar({ setOpenCollabModal, setOpenLoginModal, setOpenCreateModal}) {
    const { disconnectFromBoard, sessionConnected } = useSession();
    const { isLoggedIn } = useAuth();

    return (
        <div className="fixed z-10 inset-x-0 top-0 pointer-events-none">
            <div className="flex flex-row items-center justify-end gap-2 pointer-events-auto p-5 pt-7.5 pr-10">
                {!sessionConnected ? (
                    <button
                        type="button"
                        onClick={() => setOpenCollabModal(true)}
                        className="primary-button"
                    >
                        <Link2 size={17} strokeWidth={1.75} />
                        <span>Connect</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={disconnectFromBoard}
                        className="primary-button"
                    >
                        <Unlink size={17} strokeWidth={1.75} />
                        <span>Disconnect</span>
                    </button>
                )}

                {!isLoggedIn ?
                    (<>
                        <button
                            type="button"
                            onClick={() => setOpenLoginModal(true)}
                            className="primary-button"
                        >
                            <LogIn size={17} strokeWidth={1.75} />
                            <span>Login</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpenCreateModal(true)}
                            className="primary-button"
                        >
                            <UserPlus size={17} strokeWidth={1.75} />
                            <span>Sign Up</span>
                        </button>
                    </>)
                 : <ProfileDropdown />}
            </div>
        </div>
    );
}

export default OptionsBar;