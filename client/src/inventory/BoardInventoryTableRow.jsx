import { PenTool, EllipsisVertical } from "lucide-react";
import {useNavigate, NavLink} from "react-router-dom";
import {useBoard} from "../contexts/BoardContext.jsx";

function BoardInventoryTableRow({ board }) {
    const {loadBoard} = useBoard();
    const navigate = useNavigate();

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

    return (
        <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-200 transition-colors select-none"
        onDoubleClick={handleRowDoubleClick}>
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <PenTool size={16} strokeWidth={1.75} />
                    </div>
                    <span >{board.boardName}</span>
                </div>
            </td>
            <td className="px-5 py-3">{dateFormat(board.createdAt)}</td>
            <td className="px-5 py-3">{dateFormat(board.updatedAt)}</td>
            <td>
                <button className="rounded-full px-2 py-2 hover:bg-gray-300 cursor-pointer"
                onDoubleClick={(e)=>
                    e.stopPropagation()
                }>
                    <EllipsisVertical/>
                </button>
            </td>
        </tr>
    );
}
export default BoardInventoryTableRow;