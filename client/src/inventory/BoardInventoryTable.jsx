import {useState, useEffect} from "react";
import BoardInventoryTableRow from "./BoardInventoryTableRow.jsx";
import { ArrowUp, ArrowDown} from "lucide-react";

function BoardInventoryTable({boards, searchQuery}) {

    const [filteredBoards, setFilteredBoards] = useState([]);
    const [sortBy, setSortBy] = useState("Date created");
    const [arrowsUp, setArrowsUp] = useState([false, false, false]);

    const tableHeads = [
        { name: "Name", key: "boardName" },
        { name: "Date created", key: "createdAt" },
        { name: "Date modified", key: "updatedAt" },
    ];

    function toggleArrow(index) {
        setArrowsUp((prev) =>
            prev.map((value, i) => (i === index ? !value : value))
        );
    }

    function handleHeaderClick(index, name) {
        console.log("header clicked ", index, name)
        toggleArrow(index);
        setSortBy(name);
    }

    function getComparator() {
        const index = tableHeads.findIndex((head) => head.name === sortBy);
        if (index === -1) return () => 0;

        const { key } = tableHeads[index];
        const ascending = arrowsUp[index];

        return (a, b) =>
            ascending
                ? (a[key] > b[key] ? -1 : 1)
                : (a[key] < b[key] ? -1 : 1);
    }

    function changeSortBy(){
        const sorted = [...filteredBoards];
        sorted.sort(getComparator());
        setFilteredBoards(sorted);
    }

    function searchFilter(){
        const filtered = [...boards].filter(
            b => b.boardName.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredBoards(filtered);
    }

    function getArrowType(index){
        return arrowsUp[index] ?
            <ArrowUp size={15} strokeWidth={2}/>
            : <ArrowDown size={15} strokeWidth={2}/>

    }

    useEffect(()=>{
        searchFilter();
    },[searchQuery, boards]);

    useEffect(() => {
        changeSortBy();
    },[sortBy, arrowsUp]);

    if (boards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
                <p className="text-sm font-medium text-gray-900">No boards yet</p>
                <p className="text-sm text-gray-500">Boards you create will show up here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="border-b border-gray-100">
                            {tableHeads.map((head,index) => (
                                <th key={index} className="inventory-table-head " onClick={()=>handleHeaderClick(index, head.name)}>
                                    <button className="font-medium flex items-center">
                                        <span>{head.name}</span>
                                        <span className="w-4 shrink-0">{sortBy === head.name && getArrowType(index)}</span>
                                    </button>
                                </th>))}
                        </tr>
                    </thead>
                    <tbody>
                    {filteredBoards.map((board) => (
                        <BoardInventoryTableRow key={board.boardId} board={board} />
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default BoardInventoryTable;