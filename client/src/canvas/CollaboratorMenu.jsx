import { UserPen, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { useClickOutside } from "../components/useClickOutside.js";
import { useSession } from "../contexts/SessionContext.jsx"

function CollaboratorMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const { collaborators, getClientId} = useSession();

    useClickOutside(menuRef, () => setOpen(false), open);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
                <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-600">
                    <UserPen size={16} strokeWidth={1.75} />
                    {collaborators.length > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {collaborators.length}
                        </span>
                    )}
                </div>

                <ChevronDown
                    size={16}
                    strokeWidth={1.75}
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50">
                    {collaborators.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No one else is here yet
                        </div>
                    ) : (
                        <div className="p-1.5">
                            {collaborators.map((person) => (
                                <div
                                    key={person.id}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700"
                                >
                                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-600 shrink-0">
                                        <UserPen size={14} strokeWidth={1.75} />
                                    </div>
                                    <span className="truncate">{getClientId() === person.clientId ?
                                        `${person.displayName}  (you)` : person.displayName
                                    }</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CollaboratorMenu;