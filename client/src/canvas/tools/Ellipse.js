export const ELLIPSE_STYLE = {
    roughness: 0,
    strokeColor: "#000000",
    strokeWidth: 2,
    strokeStyle: "solid",
}
function toRoughOptions(drawing) {
    return {
        roughness: drawing.roughness ?? ELLIPSE_STYLE.roughness,
        stroke: drawing.strokeColor ?? ELLIPSE_STYLE.strokeColor,
        strokeWidth: drawing.strokeWidth ?? ELLIPSE_STYLE.strokeWidth,
        strokeStyle: drawing.strokeStyle ?? ELLIPSE_STYLE.strokeStyle,
        seed: drawing.seed
    };
}


export function drawEllipseElement(rc, drawing){
    rc.ellipse(drawing.x, drawing.y, drawing.width, drawing.height, toRoughOptions(drawing));
}

export function createEllipseTool(previewRc, previewCanvas){
    let isDrawing = false;
    let starting = {x: 0, y: 0};
    let ending = {x: 0, y: 0};

    function getCoords(){
        const x = Math.min(starting.x, ending.x);
        const y = Math.min(starting.y, ending.y);
        const width = Math.abs(ending.x - starting.x);
        const height = Math.abs(ending.y - starting.y);

        const centerX = x + width / 2;
        const centerY = y + height / 2;
        return { x: centerX, y: centerY, width, height };
    }

    function drawPreview() {
        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        const {x, y, width, height} = getCoords();
        previewRc.ellipse(x, y, width, height, toRoughOptions(ELLIPSE_STYLE));
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
            type: "ellipse",
            seed: Math.floor(Math.random() * 2 ** 31),
            ...getCoords(),
            ...ELLIPSE_STYLE,
        };
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}