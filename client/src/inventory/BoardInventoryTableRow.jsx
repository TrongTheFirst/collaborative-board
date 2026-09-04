import { PenTool, EllipsisVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {useNavigate, NavLink} from "react-router-dom";
import {useBoard} from "../contexts/BoardContext.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";
import ProfileDropdown from "../components/ProfileDropdown.jsx";
import BoardInventoryTableRowMenu from "./BoardInventoryTableRowMenu.jsx";

function BoardInventoryTableRow({ board, trash, onTrash}) {
    const {loadBoard, editBoard} = useBoard();
    const {token, userId} = useAuth();
    const navigate = useNavigate();
    const [boardName, setBoardName] = useState(board.boardName);
    const inputRef = useRef(null);

    useEffect(() => {
        if (document.activeElement !== inputRef.current) {
            setBoardName(board.boardName);
        }
    }, [board.boardName]);

    function dateFormat(date){
        return new Date(date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function handleRowDoubleClick(){
        loadBoard(board.boardId);
        navigate("/");
    }

    async function commitRename(){
        const trimmed = boardName.trim();
        if (!trimmed || trimmed === board.boardName) {
            setBoardName(board.boardName);
            return;
        }
        try {
            await editBoard({ ...board, boardName: trimmed }, token, userId);
        } catch (err) {
            setBoardName(board.boardName);
        }
    }

    function handleKeyDown(e){
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
        } else if (e.key === "Escape") {
            setBoardName(board.boardName);
            e.target.blur();
        }
    }

    return (
        <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-200 transition-colors select-none"
            onDoubleClick={!trash ? handleRowDoubleClick : undefined}>
            <td className="px-5 py-3"
                // onDoubleClick={e => {e.stopPropagation();}}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        <PenTool size={16} strokeWidth={1.75} />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={boardName}
                        onChange={e => setBoardName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleKeyDown}
                        disabled={trash}
                        onClick={e => e.stopPropagation()}
                        onDoubleClick={e => {e.stopPropagation();}}
                        className=" bg-transparent px-1 py-1 text-sm text-gray-900 outline-none rounded-md focus:bg-white focus:border focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
                    />
                </div>
            </td>
            <td className="px-5 py-3">{dateFormat(board.createdAt)}</td>
            <td className="px-5 py-3">{dateFormat(board.updatedAt)}</td>
            <td onDoubleClick={(e)=> e.stopPropagation()}
            >
                <BoardInventoryTableRowMenu board={board} renameRef={inputRef} trash={trash} onTrash={onTrash}/>
            </td>
        </tr>
    );
}
export default BoardInventoryTableRow;