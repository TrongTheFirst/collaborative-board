import {
    hitBox,
    hitPencil,
    hitLine,
    hitEllipse,
    pointsHitDrawing,
    segmentHitsDrawing,
} from "./HitDetection";



export function createEraserTool(previewRc, previewCanvas, drawings, onErase){
    let isErasing = false;
    let toErase = new Set();
    let lastPoint = null;

    function eraseAt(x,y){
        const prev = lastPoint ?? { x, y };
        lastPoint = { x, y };
        let erased = false;
        for(let i = drawings.length - 1; i >= 0; i--){
            const drawing = drawings[i];
            if(!drawing.beingErased && (pointsHitDrawing(x,y, drawings[i]) || segmentHitsDrawing(prev, { x, y }, drawings[i]))){
                drawing.beingErased = true;
                erased = true;
                toErase.add(drawing);
            }
        }
        if(erased) onErase();
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