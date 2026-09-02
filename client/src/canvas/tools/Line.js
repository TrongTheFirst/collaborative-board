export const LINE_STYLE = {
    roughness: 0,
    strokeColor: "#000000",
    strokeWidth: 2,
    strokeStyle: "solid",
}

function toRoughOptions(drawing) {
    return {
        roughness: drawing.roughness ?? LINE_STYLE.roughness,
        stroke: drawing.strokeColor ?? LINE_STYLE.strokeColor,
        strokeWidth: drawing.strokeWidth ?? LINE_STYLE.strokeWidth,
        strokeStyle: drawing.strokeStyle ?? LINE_STYLE.strokeStyle,
        seed: drawing.seed
    };
}

export function drawLineElement(rc, drawing){
    rc.line(drawing.x, drawing.y, drawing.x2, drawing.y2, toRoughOptions(drawing));
}

export function createLineTool(previewRc, previewCanvas){
    let isDrawing = false;
    let starting = {x: 0, y: 0};
    let ending = {x: 0, y: 0};

    function drawPreview(){
        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewRc.line(starting.x, starting.y, ending.x, ending.y, toRoughOptions(LINE_STYLE));
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

    function onPointerUp(){
        if(!isDrawing) return null;
        isDrawing = false;

        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        return {
            clientId: crypto.randomUUID(),
            type: "line",
            seed: Math.floor(Math.random() * 2 ** 31),
            x: starting.x,
            y: starting.y,
            x2: ending.x,
            y2: ending.y,
            ...LINE_STYLE
        };
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}