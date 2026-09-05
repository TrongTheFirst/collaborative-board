import {useRef, useEffect, useState} from 'react'
import { useParams, useNavigate, useLocation} from "react-router-dom";
import rough from "roughjs/bin/rough";
import Toolbar from "./Toolbar.jsx";
import OptionsBar from "./OptionsBar.jsx";
import Customization from "./Customization.jsx";
import { useSession} from "../contexts/SessionContext.jsx";
import {useBoard}  from "../contexts/BoardContext.jsx";
import { useNotif } from "../contexts/NotificationContext.jsx";
import CollabStartModal from "../components/CollabStartModal.jsx";
import  CollabEndModal from "../components/CollabEndModal.jsx";
import LoginModal from "../users/LoginModal.jsx"
import CreateModal from "../users/CreateModal.jsx"
import NotificationBanner from "../components/NotificationBanner.jsx"
import { createPencilTool, drawPencilElement } from "./tools/Pencil.js";
import { createTextTool, drawTextElement, commitTextTool, TEXT_STYLE} from "./tools/Text.js";
import { createRectangleTool, drawRectangleElement } from "./tools/Rectangle.js";
import { createEllipseTool, drawEllipseElement } from "./tools/Ellipse.js";
import { createLineTool, drawLineElement } from "./tools/Line.js"
import { createEraserTool } from "./tools/Eraser.js";
import { createHandTool } from "./tools/Hand.js";

function Board(){
    const [openCollabStartModal, setOpenCollabStartModal] = useState(false);
    const [openCollabEndModal, setOpenCollabEndModal] = useState(false);
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [activeTool, setActiveTool] = useState("pencil");
    const [textInput, setTextInput] = useState(null);
    const [errors, setErrors] = useState(null);

    const { showNotif } = useNotif();
    const {sendDrawing, sendErase, inSession, connectToRoom, isHost, viewMode} = useSession();
    const {drawings, addDrawing, clearDrawings,
        deleteAllBoardElements, deleteDrawingByClientId, removeDrawingByClientId,
        setBoardDrawings, drawingsLoaded, boardId} = useBoard();

    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const previewRcRef = useRef(null);
    const drawingsRef = useRef(drawings);
    const drawingsCopyRef = useRef([]);
    const [drawingsCopy, setDrawingsCopy] = useState([]);
    const pageInitializedRef = useRef(false);
    const drawingsCountRef = useRef(0);
    const textAreaRef = useRef(null);
    const activeToolRef = useRef(activeTool);
    const panOffsetRef = useRef({x: 0, y: 0});


    function clearCanvas(){
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.restore();
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

    function hexToRgba(hex, opacity = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    function toFaded(drawing){
        if(!drawing.beingErased) return drawing;
        return drawing.type === "text"
            ? { ...drawing, fillStyle: hexToRgba(drawing.fillStyle ?? "#000000", 0.35) }
            : { ...drawing, strokeColor: hexToRgba(drawing.strokeColor ?? "#000000", 0.35) };
    }

    function drawBoard(elements = drawingsRef.current){
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext("2d");

        elements.forEach((drawing) => {
            const faded = toFaded(drawing);
            if(faded.type === "text"){
                drawElement(ctx, faded);
            }
            else{
                drawElement(rc, faded)
            }
        });

    }

    function applyTransform(ctx){
        ctx.setTransform(1, 0, 0, 1, panOffsetRef.current.x, panOffsetRef.current.y);
    }

    useEffect(() => {
        drawingsRef.current = drawings;
        drawingsCopyRef.current = drawings.map(d => ({...d, beingErase:false}));
        setDrawingsCopy(drawingsCopyRef.current);

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

    useEffect(() => {
        if (!canvasRef.current || !pageInitializedRef.current) return;
        clearCanvas();
        drawBoard(drawingsCopy);
    }, [drawingsCopy]);

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

        const pencil = createPencilTool(previewRc, previewCanvas, panOffsetRef);
        const text = createTextTool(previewRc, previewCanvas, setTextInput);
        const rectangle = createRectangleTool(previewRc, previewCanvas);
        const ellipse = createEllipseTool(previewRc, previewCanvas);
        const line = createLineTool(previewRc, previewCanvas);
        const eraser = createEraserTool(previewRc, previewCanvas, drawingsCopyRef.current, () => setDrawingsCopy([...drawingsCopyRef.current]));
        const hand = createHandTool( (dx,dy)=>{
            panOffsetRef.current = {
                x: panOffsetRef.current.x + dx,
                y: panOffsetRef.current.y + dy
            }
            applyTransform(ctx);
            applyTransform(previewRc.ctx);
            clearCanvas();
            drawBoard(drawingsRef.current);
        }, panOffsetRef);
        const tools = { pencil, rectangle, ellipse, line, text, eraser, hand};
        let getActiveTool = () => tools[activeToolRef.current] ?? pencil;

        if(viewMode && !isHost()){
            getActiveTool = () => line;
            setActiveTool("hand");
        }

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            previewCanvas.width = window.innerWidth;
            previewCanvas.height = window.innerHeight;
            applyTransform(ctx);
            applyTransform(previewRc.ctx);
            drawBoard();
        };
        resize();

        const toOffset = (e) => {
            return {
                clientX: e.clientX - panOffsetRef.current.x,
                clientY: e.clientY - panOffsetRef.current.y,
                pointerId: e.pointerId,
            };
        }

        const handlePointerDown = (e) => {
            canvas.setPointerCapture(e.pointerId);
            const offset = activeToolRef.current === "hand" ? e : toOffset(e);
            getActiveTool().onPointerDown(offset);
        };

        const handlePointerMove = (e) => {
            const offset = activeToolRef.current === "hand" ? e : toOffset(e);
            getActiveTool().onPointerMove(offset);
        };

        const handlePointerUp = (e) => {
            if (canvas.hasPointerCapture(e.pointerId)) {
                canvas.releasePointerCapture(e.pointerId);
            }
            const offset = activeToolRef.current === "hand" ? e : toOffset(e);
            const drawing = getActiveTool().onPointerUp(offset);
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
    }, [boardId, drawings, viewMode]);

    function commitText() {
        const drawing = commitTextTool(previewCanvasRef.current, textAreaRef.current, textInput);
        setTextInput(null);

        if (!drawing) return;

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
            <div className="flex">
                <Customization currTool={activeTool}/>
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
            <NotificationBanner />
            <canvas ref={canvasRef} className="fixed z-0 inset-0 w-screen h-screen"  />
            <canvas ref={previewCanvasRef} className="fixed z-0 inset-0 w-screen h-screen pointer-events-none" />
            {textInput && (
                <textarea
                    ref={textAreaRef}
                    onBlur={commitText}
                    onInput={handleTextAreaInput}
                    style={{
                        position: "fixed",
                        left: textInput.x + panOffsetRef.current.x + 3,
                        top: textInput.y + panOffsetRef.current.y,
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