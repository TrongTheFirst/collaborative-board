import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import BoardToolbar from "./BoardInventoryToolbar.jsx";
import BoardInventoryTable from "./BoardInventoryTable.jsx";
import BoardInventorySidebar from "./BoardInventorySidebar.jsx";

function BoardInventory(){
    const {userId, BASE_URL} = useAuth();
    const [userBoards, setUserBoards] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchBoards();
    }, [userId]);

    async function fetchBoards(){
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(BASE_URL+`/board/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if(response.ok){
            const payload = await response.json();
            const filtered = payload.filter(b => !b.trashed);
            setUserBoards(filtered);
        }
        else{
            console.error(await response.text());
        }
    }

    function onChange(boardId){
        setUserBoards((prev) => prev.filter((b) => b.boardId !== boardId));
    }


    return (
        <>
            <div className="flex h-screen flex-col md:flex-row overflow-hidden">
                <BoardInventorySidebar />

                <div className="flex flex-1 flex-col">
                    <BoardToolbar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    <div className="px-5 pb-4">
                        <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
                    </div>

                    <div className="px-5 pb-5">
                        <BoardInventoryTable
                            boards={userBoards}
                            searchQuery={searchQuery}
                            onChange={onChange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
export default BoardInventory;