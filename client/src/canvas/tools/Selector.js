import {
    hitBox,
    hitPencil,
    hitLine,
    hitEllipse,
    pointsHitDrawing,
    segmentHitsDrawing,
} from "./HitDetection";
import { createRectangleTool } from "./Rectangle.js";

export function createSelectorTool(canvas, drawings, onMove){
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let selectedElement = null;

    function findElementAt(x, y){
        for(let i = drawings.length - 1; i >= 0; i--){
            const drawing = drawings[i];
            if(pointsHitDrawing(x, y, drawing)){
                return drawing;
            }
        }
        return null;
    }

    function translateElement(element, dx, dy){
        if (element.type === "line") {
            return { ...element, x: element.x + dx, y: element.y + dy, x2: element.x2 + dx, y2: element.y2 + dy };
        }
        return { ...element, x: element.x + dx, y: element.y + dy };
    }

    function onPointerDown(e){
        const hit = findElementAt(e.clientX, e.clientY);
        if (hit) {
            isDragging = true;
            selectedElement = hit;
            dragStart = { x: e.clientX, y: e.clientY };
        }
    }

    function onPointerMove(e){
        const hovering = findElementAt(e.clientX, e.clientY);
        canvas.style.cursor = hovering || isDragging ? "move" : "default";

        if (!isDragging) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        dragStart = { x: e.clientX, y: e.clientY };

        selectedElement = translateElement(selectedElement, dx, dy);
        onMove(selectedElement);
    }

    function onPointerUp(){
        if (!isDragging) return null;
        isDragging = false;

        const moved = selectedElement;
        selectedElement = null;
        return moved;
    }


    return { onPointerDown, onPointerMove, onPointerUp };
}