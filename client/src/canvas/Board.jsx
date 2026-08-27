import {useRef, useEffect, useState} from 'react'
import rough from "roughjs/bin/rough";
import Toolbar from "./Toolbar.jsx";
import OptionsBar from "./OptionsBar.jsx";
import { useSession} from "../contexts/SesssionContext.jsx";
import CollabModal from "../components/CollabModal.jsx";
import LoginModal from "../users/LoginModal.jsx"
import CreateModal from "../users/CreateModal.jsx"

function Board(){
    const [openCollabModal, setOpenCollabModal] = useState(false);
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const {sendMessage, sessionConnected, boardId} = useSession();
    const canvasRef = useRef(null);
    const [drawings, setDrawings] = useState(() => JSON.parse(localStorage.getItem("drawings")) ?? []);


    function clearCanvas(){
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
    }

    function drawBoard(){
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);

        drawings.forEach((drawing) => {
            const points = drawing.points.map((point) => [
                drawing.x + point.x,
                drawing.y + point.y,
            ]);

            rc.linearPath(points, {
                roughness: 0.5,
                stroke: "black",
                strokeWidth: 2,
            });
        })
    }

    useEffect(() => {
        let isDrawing = false;
        let points = [];
        let starting = {x: 0, y: 0};
        let lastPoint = null;
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawBoard();
        };
        resize();


        const handlePointerDown = (e) => {
            canvas.setPointerCapture(e.pointerId);
            isDrawing = true;
            starting = {
                x: e.clientX,
                y: e.clientY
            };
            lastPoint = {
                x: e.clientX,
                y: e.clientY,
            };
            points = [{x:0,y:0}];
        }

        const handlePointerMove = (e) => {
            if (!isDrawing) return;

            const point = {
                x: e.clientX,
                y: e.clientY,
            };

            rc.line(
                lastPoint.x,
                lastPoint.y,
                point.x,
                point.y,
                {
                    roughness: 0.5,
                    stroke: "black",
                    strokeWidth: 2,
                }
            );

            lastPoint = point;
            points.push({
                x: point.x - starting.x,
                y: point.y - starting.y
            });
        }


        const handlePointerUp = (e) => {
            if(!isDrawing) return;
            isDrawing = false;
            lastPoint = null;

            if (canvas.hasPointerCapture(e.pointerId)) {
                canvas.releasePointerCapture(e.pointerId);
            }
            if(points.length > 0){
                const drawing = {
                    type: "freedraw",
                    x: starting.x,
                    y: starting.y,
                    points,
                    roughness: 0.5,
                    strokeColor: "#000000",
                    strokeWidth: 2
                }
                setDrawings(prev => {
                    const newDrawings = [...prev, drawing];
                    localStorage.setItem("drawings", JSON.stringify(newDrawings));
                    return newDrawings;
                });
                // if(sessionConnected){
                    const {type, ...element_data} = drawing;
                    const boardElement = {
                        element_id: 1,
                        board_id: boardId,
                        type,
                        element_data: element_data
                    }
                    console.log(element_data);
                    const message = {
                        sender: "test",
                        boardElement
                    }
                    sendMessage(message,1);
                // }
            }
        }

        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerUp);
        canvas.addEventListener("pointerleave", handlePointerUp)
        window.addEventListener("resize", resize);


        return () => {
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerup", handlePointerUp);

        };
    }, []);

    return(
        <>
            <div className="flex justify-end">
                <Toolbar setDrawings={setDrawings} clearCanvas={clearCanvas} />
                <OptionsBar setOpenCollabModal={setOpenCollabModal} setOpenLoginModal={setOpenLoginModal} setOpenCreateModal={setOpenCreateModal}/>
            </div>

            <canvas ref={canvasRef} className="fixed z-0 inset-0 w-screen h-screen"  />
            {openCollabModal && <CollabModal setOpenCollabModal={setOpenCollabModal}/>}
            {openLoginModal && <LoginModal setOpenLoginModal={setOpenLoginModal} setOpenCreateModal={setOpenCreateModal}/>}
            {openCreateModal && <CreateModal setOpenLoginModal={setOpenLoginModal} setOpenCreateModal={setOpenCreateModal}/>}
        </>
    );
}

export default Board;