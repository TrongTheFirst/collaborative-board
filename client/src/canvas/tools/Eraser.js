import {drawPencilElement} from "./Pencil.js";
import {drawTextElement} from "./Text.js";
import {drawRectangleElement} from "./Rectangle.js";

const ERASER_RADIUS = 4;

//Rectangle
//Text
const inBetween = (p, b1, b2) => p >= Math.min(b1,b2) && p <= Math.max(b1,b2);
function hitBox(x, y, drawing) {
    const left = drawing.x;
    const right = drawing.x + drawing.width;
    const top = drawing.y;
    const bottom = drawing.y + drawing.height;

    const nearLeftOrRight =
        inBetween(y, top, bottom) &&
        (Math.abs(x - left) <= ERASER_RADIUS || Math.abs(x - right) <= ERASER_RADIUS);

    const nearTopOrBottom =
        inBetween(x, left, right) &&
        (Math.abs(y - top) <= ERASER_RADIUS || Math.abs(y - bottom) <= ERASER_RADIUS);

    return nearLeftOrRight || nearTopOrBottom;
}

//Free draw
const vectorSub = (a,b) => ({x: a.x - b.x, y: a.y - b.y});
const dotProd = (a,b) => a.x * b.x + a.y * b.y;
const lengthSquared = a => a.x**2 + a.y**2;
const shortestDistanceBetweenPointAndLineSegment = (p,a,b) =>{
    const v1 = vectorSub(b,a);
    const v2 = vectorSub(p,a);
    const v1LenSq = lengthSquared(v1);
    if (v1LenSq === 0) {
        return Math.hypot(v2.x, v2.y);
    }

    const proj = dotProd(v1,v2);
    let d = proj / v1LenSq;
    d = Math.max(0, Math.min(1, d));

    const closest = { x: a.x + d * v1.x, y: a.y + d * v1.y };
    return Math.hypot(p.x - closest.x, p.y - closest.y);
}
function hitPencil(x,y,drawing){
    const points = drawing.points.map((point) => ({
        x: drawing.x + point.x,
        y: drawing.y + point.y,
    }));
    const eraserPoint = {x,y}
    for(let i=0; i<points.length-1; i++){
        const dist = shortestDistanceBetweenPointAndLineSegment(eraserPoint,points[i],points[i+1]);
        if(dist <= ERASER_RADIUS) return true;
    }
    return false;
}

//Line
function hitLine(x,y,drawing){
    const dist = shortestDistanceBetweenPointAndLineSegment({x,y},{x:drawing.x,y:drawing.y},{x:drawing.x2,y:drawing.y2});
    return dist <= ERASER_RADIUS;
}

//Ellipse
function hitEllipse(x,y,drawing){
    /*
    d = ((px-cx)^2/rx^2 + (py-cy)^2/ry^2)
     */
    const radiusX = drawing.width / 2;
    const radiusY = drawing.height / 2;

    const dist =
        ((x - drawing.x) ** 2) / (radiusX ** 2) +
        ((y - drawing.y) ** 2) / (radiusY ** 2);

    const tolerance = ERASER_RADIUS / Math.min(radiusX, radiusY);
    return Math.abs(dist - 1) <= tolerance;
}


function pointsHitDrawing(x,y,drawing){
    switch (drawing.type) {
        case "freedraw":
            return hitPencil(x,y,drawing);
        case "line":
            return hitLine(x,y,drawing);
        case "text":
        case "rectangle":
            return hitBox(x, y, drawing);
        case "ellipse":
            return hitEllipse(x,y,drawing);
        default:
            break;

    }
}

function segmentHitsDrawing(p1, p2, drawing) {
    const steps = 4;
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t;
        if (pointsHitDrawing(x, y, drawing)) return true;
    }
    return false;
}

export function createEraserTool(previewRc, previewCanvas, drawings){
    let isErasing = false;
    let toErase = new Set();
    let lastPoint = null;

    function eraseAt(x,y){
        const prev = lastPoint ?? { x, y };
        lastPoint = { x, y };
        for(let i = drawings.length - 1; i >= 0; i--){
            if(pointsHitDrawing(x,y, drawings[i]) || segmentHitsDrawing(prev, { x, y }, drawings[i])){
                toErase.add(drawings[i]);
            }
        }
    }

    function onPointerDown(e){
        toErase = new Set();
        isErasing = true;
    }

    function onPointerMove(e){
        if(!isErasing) return;
        eraseAt(e.clientX, e.clientY);
    }

    function onPointerUp(e){
        if(!isErasing) return null;

        isErasing = false;
        return toErase;
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}