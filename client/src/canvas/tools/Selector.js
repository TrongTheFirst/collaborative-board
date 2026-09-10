import {
    pointsHitDrawing,
    getBoundingBox
} from "./HitDetection";

export function createSelectorTool(previewRc, previewCanvas, canvas, drawingsRef, onMove, onSelect){
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let selectedElement = null;
    let hoveredElement = null;;

    function getSelected(){
        return selectedElement;
    }

    function findElementAt(x, y){
        const drawings = drawingsRef.current;
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

    function clearPreview(){
        const ctx = previewCanvas.getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.restore();
    }

    function drawHighlight(drawing){
        clearPreview();
        const padding = 6;
        const box = getBoundingBox(drawing);
        previewRc.rectangle(
            box.x1 - padding,
            box.y1 - padding,
            (box.x2 - box.x1) + padding * 2,
            (box.y2 - box.y1) + padding * 2, {
            roughness: 0,
            stroke: "#6366f1",
            strokeWidth: 1.5,
            strokeStyle: "solid",
            roundness: null,
        });
    }

    function onPointerDown(e){
        const hit = findElementAt(e.clientX, e.clientY);
        if (hit) {
            selectedElement = hit;
            isDragging = true;
            dragStart = { x: e.clientX, y: e.clientY };
            drawHighlight(hit);
            onSelect(selectedElement);
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
        drawHighlight(selectedElement);
        onMove(selectedElement);
        onSelect(selectedElement);
    }

    function onPointerUp(){
        if (!isDragging) return null;
        isDragging = false;

        const moved = selectedElement;
        selectedElement = null;
        onSelect(null);
        return moved;
    }


    return { onPointerDown, onPointerMove, onPointerUp, getSelected};
}