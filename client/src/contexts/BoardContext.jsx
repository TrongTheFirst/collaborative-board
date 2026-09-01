import {createContext, useCallback, useContext, useState, useRef, useEffect} from "react";
import { useParams } from "react-router-dom"
import {useAuth} from "./AuthContext.jsx";
import {useSession} from "./SessionContext.jsx";

/*
on load, determine if board is in DB (has boardId).
if it is get drawings from DB
otherwise, create a new board in DB and assign boardId

when boardId changes, fetch drawings or add board
 */
const BoardContext = createContext(null);
export function BoardProvider({ children }) {

    const { userId, BASE_URL } = useAuth();
    const { connectToRoom, isInRoom } = useSession();
    const [drawings,setDrawings] = useState([]);
    const [drawingsLoaded, setDrawingsLoaded] = useState(false);
    const currentBoard = useRef(null);
    const createBoard = useRef(false)
    const [boardId, setBoardId] = useState(() => localStorage.getItem("boardId"));
    const { roomCode } = useParams();

    useEffect(()=>{
        if(roomCode && !isInRoom(roomCode)){//run once
            const onReply = (boardId, fetchedDrawings) =>{
                setBoardId(boardId);
                setBoardState(fetchedDrawings);
            }
            connectToRoom(roomCode, onReply, setBoardDrawings);
        }
    },[roomCode])

    useEffect(()=>{
        if (boardId) {
            fetchBoardElements(boardId);
            fetchBoard(boardId);
            return;
        }

        if (roomCode) {
            return;
        }

        if (createBoard.current) {
            return;
        }

        createBoard.current = true;

        addBoard().catch(error => {
            console.error(error);
            createBoard.current = false;
        });
    }, [boardId, roomCode]);

    async function addBoard(){
        const headers = {"Content-Type": "application/json"};
        const token = localStorage.getItem("token");
        const board = {
            boardId: 0,
            ownerId: 0,
            boardName: "Board",
            createdAt: Temporal.Now.plainDateTimeISO(),
            updatedAt: Temporal.Now.plainDateTimeISO()
        }
        if(token){
            headers.Authorization = `Bearer ${token}`;
            board.ownerId = userId;
        }
        const response = await fetch(BASE_URL+`/board/add`,{
            method:"POST",
            headers: headers,
            body: JSON.stringify(board)
        });
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        const payload = await response.json();
        currentBoard.current = payload;
        setBoardId(payload.boardId);
        localStorage.setItem("boardId",payload.boardId);
        createBoard.current = false;
    }

    async function fetchBoardElements(boardId){
        try {
            const response = await fetch(BASE_URL+`/element/${boardId}`);
            if(response.ok){
                const payload = await response.json();
                const fetchedDrawings = payload.map(({ type, elementData }) => ({type, ...elementData,}));
                setDrawings(fetchedDrawings);
                localStorage.setItem("drawings",JSON.stringify(fetchedDrawings));
                console.log(`Fetched drawings from ${boardId}`);
            }
        } finally {
            setDrawingsLoaded(true);
        }
    }
    async function fetchBoard(boardId){
        const response = await fetch(BASE_URL+`/board/${boardId}`);
        if(response.ok){
            const payload = await response.json();
            currentBoard.current = payload;
        }
    }
    async function editBoard(board, token, userId){
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
        const toUpdate = {
            boardId: board.boardId,
            ownerId: userId,
            boardName: board.boardName,
            createdAt: board.createdAt,
            updatedAt: Temporal.Now.plainDateTimeISO()
        }
        const response = await fetch(BASE_URL+`/board/edit`,{
            method:"PUT",
            headers: headers,
            body: JSON.stringify(toUpdate)
        });
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        setBoard(toUpdate)
    }
    async function addDrawing(boardElement){
        try{
            const response = await fetch(BASE_URL+`/element/add`,{
                method:"POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(boardElement)
            });
            if (!response.ok) {
                throw new Error(`Failed to save drawing: ${response.status}`);
            }
        }catch(error){
            console.error("Failed to add drawing", error);
        }
    }
    // async function deleteBoardElement(){
    //     try{
    //         const response = await fetch(BASE_URL+`/element/delete`,{
    //             method:"POST",
    //             headers: {"Content-Type": "application/json"},
    //             body: JSON.stringify(boardElement)
    //         });
    //         if (!response.ok) {
    //             throw new Error(`Failed to save drawing: ${response.status}`);
    //         }
    //     }catch(error){
    //         console.error("Failed to add drawing", error);
    //     }
    // }
    async function deleteAllBoardElements(token){
            try{
                const response = await fetch(BASE_URL+`/element/delete/${boardId}`,{
                    method:"DELETE",
                    headers :{
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to delete board elements: ${response.status}`);
                }
            }catch(error){
                console.error("Failed to delete board elements", error);
            }
    }

    function setBoardDrawings(drawing){
        setDrawings((prevState) => {
            const newDrawings = [...prevState, drawing];
            localStorage.setItem("drawings",JSON.stringify(newDrawings));
            return newDrawings;
        });
    }

    function setBoardState(drawings){
        setDrawings(drawings);
        localStorage.setItem("drawings",JSON.stringify(drawings));
    }


    function clearDrawings(){
        setDrawings([]);
        localStorage.removeItem("drawings");
    }

    function getBoard(){
        return currentBoard.current;
    }

    function setBoard(board){
        currentBoard.current = board;
    }

    function clearBoard(){
        setBoardId(null);
        setDrawingsLoaded(false);
        currentBoard.current = null;
        localStorage.removeItem("boardId");
        clearDrawings();
    }

    function loadBoard(boardId){
        setBoardId(boardId);
        localStorage.setItem("boardId",boardId);
        fetchBoardElements(boardId);
        fetchBoard(boardId);
    }

    return (
        <BoardContext.Provider
            value={{
                boardId,
                setBoardId,
                getBoard,
                setBoard,
                addBoard,
                editBoard,
                loadBoard,
                clearBoard,
                drawings,
                drawingsLoaded,
                setBoardState,
                setBoardDrawings,
                addDrawing,
                clearDrawings,
                deleteAllBoardElements,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
}

export function useBoard() {
    return useContext(BoardContext);
}