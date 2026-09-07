import {useRef, useEffect, useState} from 'react'
import { useParams, useNavigate, useLocation} from "react-router-dom";
import { PencilSparkles } from "lucide-react";
import rough from "roughjs/bin/rough";
import Toolbar from "./Toolbar.jsx";
import OptionsBar from "./OptionsBar.jsx";
import ZoomBar from "./ZoomBar.jsx";
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
import { createSelectorTool } from "./tools/Selector.js";
import { handleCopy, handlePaste } from "./tools/CopyPaste.js";
import { drawImageElement } from "./tools/Image.js";

function Board(){
    const [openCollabStartModal, setOpenCollabStartModal] = useState(false);
    const [openCollabEndModal, setOpenCollabEndModal] = useState(false);
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [activeTool, setActiveTool] = useState("pencil");
    const [textInput, setTextInput] = useState(null);
    const [errors, setErrors] = useState(null);
    const [zoomPercent, setZoomPercent] = useState(100);
    const [hoveredText, setHoveredText] = useState(null);

    const { showNotif } = useNotif();
    const {sendDrawing, sendUpdate, sendErase, inSession, connectToRoom, isHost, viewMode} = useSession();
    const {drawings, addDrawing, updateDrawing, clearDrawings,
        deleteAllBoardElements, deleteDrawingByClientId, removeDrawingByClientId,
        setBoardDrawings, updateBoardDrawings, drawingsLoaded, boardId} = useBoard();

    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const previewRcRef = useRef(null);
    const drawingsRef = useRef(drawings);
    const drawingsCopyRef = useRef([]);
    const [drawingsCopy, setDrawingsCopy] = useState([]);
    const pageInitializedRef = useRef(false);
    const drawingsCountRef = useRef(0);
    const textAreaRef = useRef(null);
    const focusedTextRef = useRef(null);
    const activeToolRef = useRef(activeTool);
    const viewportTransform = useRef({x: 0, y: 0, scale: 1});
    const zoomActions = useRef({});
    const selectedElement = useRef(null);
    const lastPointerPosition = useRef({ x: 0, y: 0 });


    function clearCanvas(){
        const ctx = canvasRef.current.getContext("2d");
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
            case "image":
                drawImageElement(canvas, drawing, ()=>drawBoard());
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
        if(drawing.type === "text"){
            return { ...drawing, fillStyle: hexToRgba(drawing.fillStyle ?? "#000000", 0.35) };
        }
        if(drawing.type === "image"){
            return { ...drawing, opacity: 0.35 };
        }
        return { ...drawing, strokeColor: hexToRgba(drawing.strokeColor ?? "#000000", 0.35) };
    }

    function drawBoard(elements = drawingsRef.current){
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext("2d");

        elements.forEach((drawing) => {
            const faded = toFaded(drawing);
            if(faded.type === "text" || faded.type === "image"){
                drawElement(ctx, faded);
            }
            else{
                drawElement(rc, faded)
            }
        });

    }

    function applyTransform(ctx){
        const transform = viewportTransform.current;
        ctx.setTransform(transform.scale, 0, 0, transform.scale, transform.x, transform.y);
    }

    //load drawings
    useEffect(() => {
        drawingsRef.current = drawings;
        drawingsCopyRef.current = drawings.map(d => ({...d, beingErased:false}));
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
    //set copy of drawing for erasing preview
    useEffect(() => {
        if (!canvasRef.current || !pageInitializedRef.current) return;
        clearCanvas();
        drawBoard(drawingsCopy);
    }, [drawingsCopy]);
    //get current tool
    useEffect(() => {activeToolRef.current = activeTool;}, [activeTool]);
    //text tool textarea update
    useEffect(() => {
        // if (!canvasRef.current || !pageInitializedRef.current) return;
        if (textInput && textAreaRef.current) {
            textAreaRef.current.focus();
        }

        const editingId = textInput?.clientId;
        clearCanvas();
        if (editingId) {
            drawBoard(drawingsRef.current.filter(d => d.clientId !== editingId));
        } else {
            drawBoard(drawingsRef.current);
        }
    }, [textInput]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);
        const ctx = canvas.getContext("2d");

        const previewCanvas = previewCanvasRef.current;
        const previewRc = rough.canvas(previewCanvas);

        const pan = (dx,dy)=>{
            viewportTransform.current = {
                x: viewportTransform.current.x + dx,
                y: viewportTransform.current.y + dy,
                scale: viewportTransform.current.scale,
            }
            applyTransform(ctx);
            applyTransform(previewRc.ctx);
            clearCanvas();
            drawBoard(drawingsRef.current);
        }

        const pencil = createPencilTool(previewRc, previewCanvas, viewportTransform);
        const text = createTextTool(previewRc, previewCanvas, setTextInput, drawingsCopyRef, (hover)=>{
            if (activeToolRef.current === "text") {
                setHoveredText(hover);
            } else if (hoveredText) {
                setHoveredText(null);
            }
        });
        const rectangle = createRectangleTool(previewRc, previewCanvas);
        const ellipse = createEllipseTool(previewRc, previewCanvas);
        const line = createLineTool(previewRc, previewCanvas);
        const eraser = createEraserTool(previewRc, previewCanvas, drawingsCopyRef.current, () => setDrawingsCopy([...drawingsCopyRef.current]));
        const hand = createHandTool(pan);
        const select = createSelectorTool(previewRc, previewCanvas, canvas, drawingsCopyRef, (movedElement) => {
            drawingsCopyRef.current = drawingsCopyRef.current.map((d) =>
                d.clientId === movedElement.clientId ? movedElement : d
            );
            setDrawingsCopy([...drawingsCopyRef.current]);
        }, selection=>{selectedElement.current = selection});
        const tools = { pencil, rectangle, ellipse, line, text, eraser, hand, select };
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
            const { x, y, scale } = viewportTransform.current;
            return {
                clientX: (e.clientX - x) / scale,
                clientY: (e.clientY - y) / scale,
                pointerId: e.pointerId,
            };
        }

        const handlePointerDown = (e) => {
            canvas.setPointerCapture(e.pointerId);
            const offset = activeToolRef.current === "hand" ? e : toOffset(e);
            getActiveTool().onPointerDown(offset);
        };

        const handlePointerMove = (e) => {
            const offset = toOffset(e);
            getActiveTool().onPointerMove(activeToolRef.current === "hand" ? e : offset);
            lastPointerPosition.current = {x: offset.clientX, y: offset.clientY};
        };

        const handlePointerUp = (e) => {
            if (canvas.hasPointerCapture(e.pointerId)) {
                canvas.releasePointerCapture(e.pointerId);
            }
            const offset = activeToolRef.current === "hand" ? e : toOffset(e);
            const drawing = getActiveTool().onPointerUp(offset);
            if (!drawing) return;

            if(activeToolRef.current === "eraser") {
                drawing.forEach(d => eraseElement(d.clientId))
                return;
            }

            const {type, ...elementData} = drawing;
            const boardElement = {
                elementId: 0,
                boardId,
                type,
                elementData
            };

            if(activeToolRef.current === "select") {
                if(inSession()){
                    sendUpdate(boardElement);
                }else{
                    updateDrawing(boardElement);
                    updateBoardDrawings(drawing);
                }
            }else{
                if(inSession()){
                    sendDrawing(boardElement);
                }else{
                    addDrawing(boardElement);
                    drawingsCountRef.current += 1;
                    setBoardDrawings(drawing);
                }
            }
        };

        function applyZoom(newScale, anchorX, anchorY){
            const { x: oldX, y: oldY, scale: oldScale } = viewportTransform.current;
            const clampedScale = Math.min(Math.max(newScale, 0.1), 20);

            const newX = anchorX - (anchorX - oldX) * (clampedScale / oldScale);
            const newY = anchorY - (anchorY - oldY) * (clampedScale / oldScale);

            viewportTransform.current = {
                x: newX,
                y: newY,
                scale: clampedScale,
            };

            applyTransform(ctx);
            applyTransform(previewRc.ctx);
            clearCanvas();
            drawBoard(drawingsRef.current);
            setZoomPercent(Math.round(clampedScale * 100));
        }
        function zoomWithWheel(e){
            const { scale } = viewportTransform.current;
            const newScale = scale * Math.exp(-e.deltaY * 0.001);
            applyZoom(newScale, e.clientX, e.clientY);
        }
        function zoomIn(){
            const { scale } = viewportTransform.current;
            applyZoom(scale * 1.2, window.innerWidth / 2, window.innerHeight / 2);
        }
        function zoomOut(){
            const { scale } = viewportTransform.current;
            applyZoom(scale / 1.2, window.innerWidth / 2, window.innerHeight / 2);
        }
        function resetZoom(){
            applyZoom(1, window.innerWidth / 2, window.innerHeight / 2);
        }
        zoomActions.current = { zoomIn, zoomOut, resetZoom };

        function handleWheel(e){
            e.preventDefault();
            if(e.ctrlKey){
                zoomWithWheel(e);
            }else{
                pan(-e.deltaX, -e.deltaY);
            }

        }
        const handlePointerLeave = () => {
            canvas.style.cursor = "default";
        };
        const isTypingTarget = (target) =>{
            return target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
        }
        function copy(e){
            if (isTypingTarget(document.activeElement)) return;
            handleCopy(selectedElement, e)
        }
        function paste(e){
            if (isTypingTarget(document.activeElement)) return;
            e.clientX = lastPointerPosition.current.x;
            e.clientY = lastPointerPosition.current.y;
            const ctx = previewCanvas.getContext("2d");
            handlePaste(e, boardId, inSession, sendDrawing, addDrawing, setBoardDrawings, drawingsCountRef);
        }
        function cut(){
            if(selectedElement.current){
                eraseElement(selectedElement.current.clientId);
                selectedElement.current = null;
            }
        }


        function handleHotKeys(e){
            if(isTypingTarget(e.target)) return;
            if (e.ctrlKey || e.metaKey || e.altKey) {
                if(hoveredText && e.key === "e"){
                    handleEditText(hoveredText);
                }
                return;
            }

            if(e.key === "h" || e.key === "1"){
                setActiveTool("hand");
            }else if(e.key === "s" || e.key === "2"){
                setActiveTool("select");
            }else if(e.key === "e"){
                setActiveTool("eraser");
            }else if(e.key === "r"){
                setActiveTool("rectangle");
            }else if(e.key === "t"){
                setActiveTool("text");
            }else if(e.key === "a"){
                setActiveTool("pencil");
            }else if(e.key === "d"){
                setActiveTool("ellipse");
            }else if(e.key === "w"){
                setActiveTool("line");
            }
        }


        canvas.addEventListener("pointerleave", handlePointerLeave);
        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerUp);
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("keydown", handleHotKeys);
        window.addEventListener("resize", resize);
        window.addEventListener("copy", copy);
        window.addEventListener("paste", paste);
        window.addEventListener("cut", cut);
        return () => {
            window.removeEventListener("keydown", handleHotKeys);
            window.removeEventListener("resize", resize);
            window.removeEventListener("copy", copy);
            window.removeEventListener("paste", paste);
            window.removeEventListener("cut", cut);
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerup", handlePointerUp);
            canvas.removeEventListener("wheel", handleWheel);
            canvas.removeEventListener("pointerleave", handlePointerLeave);
        };
    }, [boardId, drawings, viewMode]);

    function eraseElement(clientId){
        if(inSession()){
            sendErase(boardId, clientId);
        }else{
            deleteDrawingByClientId(clientId);
            removeDrawingByClientId(clientId);
            drawingsCountRef.current -= 1;
        }
    }

    function commitText() {
        const box = textInput;
        if(!box) return;

        const drawing = commitTextTool(previewCanvasRef.current, textAreaRef.current, box);
        setTextInput(null);
        setHoveredText(null);

        if (!drawing) return;

        if(drawing.deleted){
            eraseElement(drawing.clientId);
            return;
        }

        const isEditing = !!box?.clientId;
        const {type, ...elementData} = drawing;
        const boardElement = { elementId: 0, boardId, type, elementData };
        if (isEditing) {
            if (inSession()) {
                sendUpdate(boardElement);
            } else {
                updateDrawing(boardElement);
                updateBoardDrawings(drawing);
            }
        } else {
            if (inSession()) {
                sendDrawing(boardElement);
            } else {
                addDrawing(boardElement);
                drawingsCountRef.current += 1;
                setBoardDrawings(drawing);
            }
        }
    }

    function increaseTextareaInput(e) {
        const textarea = e.target;

        if (textarea.scrollHeight > textarea.clientHeight) {
            const newHeight = textarea.scrollHeight;
            textarea.style.height = `${newHeight}px`;
            setTextInput((prev) => prev ? { ...prev, height: newHeight } : prev);
        }
    }
    function handleEditText(element){
        if (textInput) {
            commitText();
        }
        setTextInput(element);
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
            {hoveredText && !textInput && (
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleEditText(hoveredText)}
                    style={{
                        position: "fixed",
                        left: hoveredText.x * viewportTransform.current.scale + viewportTransform.current.x - 12,
                        top: hoveredText.y * viewportTransform.current.scale + viewportTransform.current.y - 12,
                        zIndex: 50,
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100"
                    aria-label="Edit text"
                >
                    <PencilSparkles />
                </button>
            )}
            {textInput && (
                <textarea
                    ref={textAreaRef}
                    defaultValue={textInput.text ?? ""}
                    onBlur={commitText}
                    onInput={increaseTextareaInput}
                    style={{
                        position: "fixed",
                        left: textInput.x * viewportTransform.current.scale + viewportTransform.current.x + 3,
                        top: textInput.y * viewportTransform.current.scale + viewportTransform.current.y,
                        width: textInput.width * viewportTransform.current.scale,
                        height: textInput.height * viewportTransform.current.scale,
                        font: `${TEXT_STYLE.fontWeight} ${(TEXT_STYLE.fontSize)} ${TEXT_STYLE.fontStyle}`,
                        color: TEXT_STYLE.fillStyle,
                        padding: "5px",
                        outline: "none",
                    }}
                    className="border border-black"
                />
            )}
            {openCollabStartModal && <CollabStartModal setOpenCollabStartModal={setOpenCollabStartModal} setOpenCollabEndModal={setOpenCollabEndModal}/>}
            {openCollabEndModal && <CollabEndModal setOpenCollabEndModal={setOpenCollabEndModal}/>}
            {openLoginModal && <LoginModal setOpenLoginModal={setOpenLoginModal} setOpenCreateModal={setOpenCreateModal}/>}
            {openCreateModal && <CreateModal setOpenLoginModal={setOpenLoginModal} setOpenCreateModal={setOpenCreateModal}/>}
            <ZoomBar zoomPercent={zoomPercent} zoom={{
                zoomIn: () => zoomActions.current.zoomIn(),
                zoomOut: () => zoomActions.current.zoomOut(),
                resetZoom: () => zoomActions.current.resetZoom(),
            }} />
        </>
    );
}

export default Board;