export const RECTANGLE_STYLE = {
    roughness: 0.5,
    strokeColor: "#000000",
    strokeWidth: 2,
    strokeStyle: "solid",
    roundness: null,

}
function toRoughOptions(drawing) {
    return {
        roughness: drawing.roughness ?? RECTANGLE_STYLE.roughness,
        stroke: drawing.strokeColor ?? RECTANGLE_STYLE.strokeColor,
        strokeWidth: drawing.strokeWidth ?? RECTANGLE_STYLE.strokeWidth,
        strokeStyle: drawing.strokeStyle ?? RECTANGLE_STYLE.strokeStyle,
        roundness: drawing.roundness ?? RECTANGLE_STYLE.roundness,
    };
}


export function drawRectangleElement(rc, drawing){
    rc.rectangle(drawing.x, drawing.y, drawing.width, drawing.height, toRoughOptions(drawing));
}

export function createRectangleTool(previewRc, previewCanvas){
    let isDrawing = false;
    let starting = {x: 0, y: 0};
    let ending = {x: 0, y: 0};

    function drawPreview() {
        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        const x = Math.min(starting.x, ending.x);
        const y = Math.min(starting.y, ending.y);
        const width = Math.abs(ending.x - starting.x);
        const height = Math.abs(ending.y - starting.y);

        previewRc.rectangle(x, y, width, height, toRoughOptions(RECTANGLE_STYLE));
    }

    function onPointerDown(e){
        isDrawing = true;
        starting = {x: e.clientX, y: e.clientY};
        ending = {x: e.clientX, y: e.clientY};
    }

    function onPointerMove(e){
        if(!isDrawing) return;
        ending = {x: e.clientX, y: e.clientY};
        drawPreview();
    }

    function onPointerUp(e){
        if(!isDrawing) return null;
        isDrawing = false;

        return {
            type:"rectangle",
            x: Math.min(starting.x, ending.x),
            y: Math.min(starting.y, ending.y),
            width: Math.abs(ending.x - starting.x),
            height: Math.abs(ending.y - starting.y),
            ...RECTANGLE_STYLE,
        }
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}