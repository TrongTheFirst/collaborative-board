import {useRef, useEffect, useState} from 'react'
import rough from "roughjs/bin/rough";

function Board(){
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const rc = rough.canvas(canvas);

        rc.rectangle(50, 50, 200, 100, {
            stroke: "#000",
            strokeWidth: 2,
            fill: "#fef08a",
            fillStyle: "solid",
            roughness: 2,
        });

        rc.circle(350, 100, 100, {
            stroke: "#2563eb",
            strokeWidth: 3,
            fill: "#bfdbfe",
            fillStyle: "hachure",
        });

        rc.line(50, 200, 400, 200, {
            stroke: "#ef4444",
            strokeWidth: 3,
        });
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="border"
        />
    );
}

export default Board;