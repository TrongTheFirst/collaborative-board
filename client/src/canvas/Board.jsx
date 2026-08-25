import {useRef, useEffect, useState} from 'react'
import rough from "roughjs/bin/rough";
import Toolbar from "./Toolbar.jsx";

function Board(){
    const canvasRef = useRef(null);
    const [drawings, setDrawings] = useState(() => localStorage.getItem("drawings"));
    // const [zoom, setZoom] = useState(1);
    // const initialRatioRef = useRef(window.devicePixelRatio || 1);

    let isDrawing = false;
    let points = [];
    useEffect(() => {
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();


        const getPoint = (e) => ({
            x: e.clientX,
            y: e.clientY,
        });

        const handlePointerDown = (e) => {
            isDrawing = true;
            points = [getPoint(e)];
        };

        const handlePointerMove = (e) => {
            if (!isDrawing) return;

            points.push(getPoint(e));

            // Draw the current stroke
            draw();

        };

        const draw = () => {
            const drawings = JSON.parse(localStorage.getItem("drawings")) ?? [];

            if (points.length > 1) {
                rc.curve(
                    points.map((p) => [p.x, p.y]),
                    {
                        stroke: "black",
                        strokeWidth: 1,
                        roughness: 1,
                        strokeStyle:"solid"
                    }
                );
            }
        }


        const handlePointerUp = () => {
            if(!isDrawing) return;
            isDrawing = false;
            const drawing = {
                id: crypto.randomUUID(),
                type: "freehand",
                points,
                strokeColor: "#000000",
                strokeWidth: 2
            }
            const drawings = JSON.parse(localStorage.getItem("drawings")) ?? [];
            drawings.push(drawing);
            localStorage.setItem("drawings", JSON.stringify(drawings));
            points = [];
        };

        window.addEventListener("resize", resize);
        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerUp);
        canvas.addEventListener("pointerleave", handlePointerUp);

        return () => {
            window.removeEventListener("resize", resize);

            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerup", handlePointerUp);
            canvas.removeEventListener("pointerleave", handlePointerUp);
        };
    }, []);

    return(
        <>
            <Toolbar />
            <canvas ref={canvasRef} className="fixed z-0 inset-0 w-screen h-screen"  />
        </>
    );
}

export default Board;