import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderX, SquareArrowOutUpRight, SquarePen, EllipsisVertical, RotateCcwClock, Trash2} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useBoard } from "../contexts/BoardContext.jsx";
import { useClickOutside } from "../components/useClickOutside.js";

export default function BoardInventoryTableRowMenu({board, renameRef, trash, onChange}) {
    const { userId, token } = useAuth();
    const { loadBoard, editBoard, deleteBoard } = useBoard();
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useClickOutside(dropdownRef, () => setOpen(false), open);

    function toggleOpen(){
        if (!open && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUpward(spaceBelow < 170);
        }
        setOpen((prev) => !prev);
    }

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={toggleOpen}
                    className="rounded-full px-2 py-2 hover:bg-gray-300 cursor-pointer"
                >
                    <EllipsisVertical
                        size={16}
                        strokeWidth={1.75}
                    />
                </button>

                {!trash && open && (
                    <div className={`absolute right-10 w-56 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50 ${openUpward ? "bottom-full mb-2" : "top-full mt-2"}`}>
                        <div className="border-b border-gray-100">
                            <button
                                type="button"
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                                onClick={() => {
                                    loadBoard(board.boardId);
                                    navigate("/");
                                }}
                            >
                                <SquareArrowOutUpRight size={17} strokeWidth={1.75} />
                                <span>Open</span>
                            </button>
                        </div>
                        <div className="border-b border-gray-100">
                            <button
                                type="button"
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                                onClick={() => {renameRef.current.focus();}}
                            >
                                <SquarePen size={17} strokeWidth={1.75} />
                                <span>Rename</span>
                            </button>
                        </div>
                        <div className="border-b border-gray-100">
                            <button
                                type="button"
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                                onClick={() => {
                                    editBoard({...board, trashed: true, trashedAt: Temporal.Now.plainDateTimeISO()}, token, userId);
                                    onChange(board.boardId);
                                    setOpen(false);
                                }}
                            >
                                <FolderX size={17} strokeWidth={1.75} />
                                <span>Move to trash</span>
                            </button>
                        </div>
                    </div>
                )}

                {trash && open &&
                    <div className={`absolute right-10 w-56 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden z-50 ${openUpward ? "bottom-full mb-2" : "top-full mt-2"}`}>
                        <div className="border-b border-gray-100">
                            <button
                                type="button"
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                                onClick={() => {
                                    editBoard({...board, trashed: false, trashedAt: null}, token, userId);
                                    onChange(board.boardId);
                                    setOpen(false);
                                }}
                            >
                                <RotateCcwClock size={17} strokeWidth={1.75} />
                                <span>Recover</span>
                            </button>
                        </div>
                        <div className="border-b border-gray-100">
                            <button
                                type="button"
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                                onClick={() => {
                                    deleteBoard(board.boardId);
                                    onChange(board.boardId);
                                    setOpen(false);
                                }}
                            >
                                <Trash2 size={17} strokeWidth={1.75} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                }
            </div>
        </>
    );
}