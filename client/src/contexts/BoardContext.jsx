import {createContext, useCallback, useContext, useState, useRef, useEffect} from "react";
import {useAuth} from "./AuthContext.jsx";

const BoardContext = createContext(null);
export function BoardProvider({ children }) {

    const { userId, BASE_URL } = useAuth();
    const [drawings,setDrawings] = useState([]);
    const currentBoard = useRef(null);
    const createBoard = useRef(false)
    const [boardId, setBoardId] = useState(() => localStorage.getItem("boardId"));

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

    async function fetchBoardElements(){
        const response = await fetch(BASE_URL+`/element/${boardId}`);
        if(response.ok){
            const payload = await response.json();
            setDrawings(payload);
            localStorage.setItem("drawings",JSON.stringify(payload));
        }
    }
    async function fetchBoard(){
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
    async function addDrawing(drawing){
        setDrawings((prevState) => [...prevState, drawing]);

        const {type, ...elementData} = drawing;
        const boardElement = {
            elementId: 0,
            boardId,
            type,
            elementData
        };

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
    function clearDrawings(){
        setDrawings([])
    }
    useEffect(()=>{
        if (boardId) {
            fetchBoardElements();
            fetchBoard();
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
    }, [boardId]);

    function getBoard(){
        return currentBoard.current;
    }
    function setBoard(board){
        currentBoard.current = board;
    }
    function clearBoard(){
        setBoardId(null);
        setDrawings([]);
        currentBoard.current = null;
        localStorage.removeItem("boardId");
    }

    return (
        <BoardContext.Provider
            value={{
                boardId,
                setBoardId,
                getBoard,
                setBoard,
                editBoard,
                clearBoard,
                drawings,
                addDrawing,
                clearDrawings,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
}

export function useBoard() {
    return useContext(BoardContext);
}