import { useState, useRef, useEffect} from "react";
import { Search, ChevronDown, Plus, ArrowDownUp} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../contexts/BoardContext.jsx";
import ProfileDropdown from "../components/ProfileDropdown";


function BoardInventoryToolbar({ searchQuery, setSearchQuery }) {

    const navigate = useNavigate();
    const { addBoard } = useBoard();

    function handleNewBoard() {
        addBoard();
        navigate("/");
    }

    return (
        <div className="flex items-center justify-between gap-3 p-5">
            <div className="relative">
                <Search
                    size={16}
                    strokeWidth={1.75}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search boards"
                    className="w-64 rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
            </div>
            <div className="flex items-center gap-2">
                <button type="button" onClick={handleNewBoard} className="primary-button">
                    <Plus size={17} strokeWidth={1.75} />
                    <span>New Board</span>
                </button>

                <ProfileDropdown />
            </div>
        </div>
    );
}

export default BoardInventoryToolbar;