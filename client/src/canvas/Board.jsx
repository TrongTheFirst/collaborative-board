import {useRef, useEffect, useState} from 'react'
import { useParams, useNavigate, useLocation} from "react-router-dom";
import rough from "roughjs/bin/rough";
import Toolbar from "./Toolbar.jsx";
import OptionsBar from "./OptionsBar.jsx";
import { useSession} from "../contexts/SessionContext.jsx";
import {useBoard}  from "../contexts/BoardContext.jsx";
import CollabStartModal from "../components/CollabStartModal.jsx";
import  CollabEndModal from "../components/CollabEndModal.jsx";
import LoginModal from "../users/LoginModal.jsx"
import CreateModal from "../users/CreateModal.jsx"
import { createPencilTool, drawPencilElement } from "./tools/Pencil.js";
import { createTextTool, drawTextElement, TEXT_STYLE} from "./tools/Text.js";
import { createRectangleTool, drawRectangleElement } from "./tools/Rectangle.js";
import { createEllipseTool, drawEllipseElement } from "./tools/Ellipse.js";
import { createLineTool, drawLineElement } from "./tools/Line.js"
import { createEraserTool } from "./tools/Eraser.js";

function Board(){
    const [openCollabStartModal, setOpenCollabStartModal] = useState(false);
    const [openCollabEndModal, setOpenCollabEndModal] = useState(false);
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [activeTool, setActiveTool] = useState("pencil");
    const [textInput, setTextInput] = useState(null);

    const {sendDrawing, sendErase, inSession, connectToRoom} = useSession();
    const {drawings, addDrawing, clearDrawings,
        deleteAllBoardElements, deleteDrawingByClientId, removeDrawingByClientId,
        setBoardDrawings, drawingsLoaded, boardId} = useBoard();

    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const previewRcRef = useRef(null);
    const drawingsRef = useRef(drawings);
    const pageInitializedRef = useRef(false);
    const drawingsCountRef = useRef(0);
    const textAreaRef = useRef(null);
    const activeToolRef = useRef(activeTool);


    function clearCanvas(){
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
    }

    function drawElement(canvas, drawing){
        switch (drawing.type) {
            case "freedraw":
                drawPencilElement(canvas, drawing);
                break;
            case "text":
                drawTextElement(canvas, drawing);
                break;
            case "rectangle":
                drawRectangleElement(canvas, drawing);
                break;
            case "ellipse":
                drawEllipseElement(canvas, drawing);
                break;
            case "line":
                drawLineElement(canvas, drawing);
                break;
            default:
                console.warn(`No renderer for element type "${drawing.type}"`);
        }
    }

    function drawBoard(elements = drawingsRef.current){
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext("2d");

        elements.forEach((drawing) => {
            if(drawing.type === "text"){
                drawElement(ctx, drawing);
            }
            else{
                drawElement(rc, drawing)
            }
        });
    }

    useEffect(() => {
        drawingsRef.current = drawings;
        if (!canvasRef.current) return;
        if(drawings.length < drawingsCountRef.current){//reset tracking
            clearCanvas();
            pageInitializedRef.current = false;
            drawingsCountRef.current = 0;
            return;
        }
        if(drawingsLoaded && !pageInitializedRef.current){//first drawing of board
            drawBoard(drawings);
            drawingsCountRef.current = drawings.length;
            pageInitializedRef.current = true;
            return;
        }
        if (pageInitializedRef.current && drawings.length > drawingsCountRef.current) {//draw new drawings
            drawBoard(drawings.slice(drawingsCountRef.current));
            drawingsCountRef.current = drawings.length;
        }

    }, [drawings, drawingsLoaded]);

    useEffect(() => {activeToolRef.current = activeTool;}, [activeTool]);

    useEffect(() => {
        if (textInput && textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [textInput]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext("2d");

        const previewCanvas = previewCanvasRef.current;
        const previewRc = rough.canvas(previewCanvas);

        const pencil = createPencilTool(rc);
        const text = createTextTool(previewRc, previewCanvas, setTextInput);
        const rectangle = createRectangleTool(previewRc, previewCanvas);
        const ellipse = createEllipseTool(previewRc, previewCanvas);
        const line = createLineTool(previewRc, previewCanvas);
        const eraser = createEraserTool(previewRc, previewCanvas, drawings);
        const tools = { pencil, rectangle, ellipse, line, text, eraser};
        const getActiveTool = () => tools[activeToolRef.current] ?? pencil;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            previewCanvas.width = window.innerWidth;
            previewCanvas.height = window.innerHeight;
            drawBoard();
        };
        resize();

        const handlePointerDown = (e) => {
            canvas.setPointerCapture(e.pointerId);
            getActiveTool().onPointerDown(e);
            // const pre_ctx = previewCanvasRef.current.getContext("2d");
            // pre_ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        };

        const handlePointerMove = (e) => {
            getActiveTool().onPointerMove(e);
        };

        const handlePointerUp = (e) => {
            if (canvas.hasPointerCapture(e.pointerId)) {
                canvas.releasePointerCapture(e.pointerId);
            }

            const drawing = getActiveTool().onPointerUp(e);
            if (!drawing) return;

            if(activeToolRef.current === "eraser") {
                drawing.forEach(d => {
                    if(inSession()){
                        sendErase(boardId, d.clientId);
                    }else{
                        deleteDrawingByClientId(d.clientId);
                        removeDrawingByClientId(d.clientId);
                        drawingsCountRef.current -= 1;
                    }
                })
                return;
            }

            const {type, ...elementData} = drawing;
            const boardElement = {
                elementId: 0,
                boardId,
                type,
                elementData
            };
            if(inSession()){
                sendDrawing(boardElement);
            }else{
                addDrawing(boardElement);
                drawingsCountRef.current += 1;
                setBoardDrawings(drawing);
            }
        };

        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerup", handlePointerUp);
        };
    }, [boardId, drawings]);

    function commitText() {
        const value = textAreaRef.current?.value.trim();
        const box = textInput;
        setTextInput(null);

        const preCtx = previewCanvasRef.current.getContext("2d");
        preCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);

        if (!value || !box) return;

        const drawing = {
            clientId: crypto.randomUUID(),
            type: "text",
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            text: value,
            ...TEXT_STYLE,
        };

        const {type, ...elementData} = drawing;
        const boardElement = { elementId: 0, boardId, type, elementData };
        if (inSession()) {
            sendDrawing(boardElement);
        } else {
            addDrawing(boardElement);
            drawingsCountRef.current += 1;
            setBoardDrawings(drawing);
        }
    }

    function handleTextAreaInput(e) {
        const textarea = e.target;

        if (textarea.scrollHeight > textarea.clientHeight) {
            const newHeight = textarea.scrollHeight;
            textarea.style.height = `${newHeight}px`;
            setTextInput((prev) => prev ? { ...prev, height: newHeight } : prev);
        }
    }

    return(
        <>
            <div className="flex justify-end">
                <Toolbar clearDrawings={clearDrawings}
                         clearCanvas={clearCanvas}
                         deleteAllBoardElements={deleteAllBoardElements}
                         activeTool={activeTool}
                         setActiveTool={setActiveTool}
                />
                <OptionsBar setOpenCollabStartModal={setOpenCollabStartModal}
                            setOpenCollabEndModal={setOpenCollabEndModal}
                            setOpenLoginModal={setOpenLoginModal}
                            setOpenCreateModal={setOpenCreateModal}
                />
            </div>

            <canvas ref={canvasRef} className="fixed z-0 inset-0 w-screen h-screen"  />
            <canvas ref={previewCanvasRef} className="fixed z-0 inset-0 w-screen h-screen pointer-events-none" />
            {textInput && (
                <textarea
                    ref={textAreaRef}
                    onBlur={commitText}
                    onInput={handleTextAreaInput}
                    style={{
                        position: "fixed",
                        left: textInput.x+3,
                        top: textInput.y,
                        width: textInput.width,
                        height: textInput.height,
                        font: `${TEXT_STYLE.fontWeight} ${TEXT_STYLE.fontSize} ${TEXT_STYLE.fontStyle}`,
                        padding: "5px",
                        outline: "none",
                    }}
                />
            )}
            {openCollabStartModal && <CollabStartModal setOpenCollabStartModal={setOpenCollabStartModal} setOpenCollabEndModal={setOpenCollabEndModal}/>}
            {openCollabEndModal && <CollabEndModal setOpenCollabEndModal={setOpenCollabEndModal}/>}
            {openLoginModal && <LoginModal setOpenLoginModal={setOpenLoginModal} setOpenCreateModal={setOpenCreateModal}/>}
            {openCreateModal && <CreateModal setOpenLoginModal={setOpenLoginModal} setOpenCreateModal={setOpenCreateModal}/>}
        </>
    );
}

export default Board;