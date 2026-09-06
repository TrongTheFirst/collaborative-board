export const RECTANGLE_STYLE = {
    roughness: 0,
    strokeColor: "#000000",
    strokeWidth: 2,
    strokeStyle: "solid",
    roundness: null,
}
const STROKE_DASH_PATTERNS = {
    solid: [],
    dashed: [5, 4],
    dotted: [1.5, 4],
};

function toRoughOptions(drawing) {
    return {
        roughness: drawing.roughness ?? RECTANGLE_STYLE.roughness,
        stroke: drawing.strokeColor ?? RECTANGLE_STYLE.strokeColor,
        strokeWidth: drawing.strokeWidth ?? RECTANGLE_STYLE.strokeWidth,
        strokeStyle: drawing.strokeStyle ?? RECTANGLE_STYLE.strokeStyle,
        roundness: drawing.roundness ?? RECTANGLE_STYLE.roundness,
        seed: drawing.seed
    };
}


export function drawRectangleElement(rc, drawing){
    const dash = STROKE_DASH_PATTERNS[drawing.strokeStyle] ?? STROKE_DASH_PATTERNS.solid;
    rc.ctx.setLineDash(dash);
    rc.rectangle(drawing.x, drawing.y, drawing.width, drawing.height, toRoughOptions(drawing));
    rc.ctx.setLineDash([])
}

export function createRectangleTool(previewRc, previewCanvas){
    let isDrawing = false;
    let starting = {x: 0, y: 0};
    let ending = {x: 0, y: 0};

    function drawPreview() {
        const ctx = previewCanvas.getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.restore();

        const x = Math.min(starting.x, ending.x);
        const y = Math.min(starting.y, ending.y);
        const width = Math.abs(ending.x - starting.x);
        const height = Math.abs(ending.y - starting.y);

        const dash = STROKE_DASH_PATTERNS[RECTANGLE_STYLE.strokeStyle] ?? STROKE_DASH_PATTERNS.solid;
        ctx.setLineDash(dash);
        previewRc.rectangle(x, y, width, height, toRoughOptions(RECTANGLE_STYLE));
        ctx.setLineDash([]);
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
            clientId: crypto.randomUUID(),
            type:"rectangle",
            seed: Math.floor(Math.random() * 2 ** 31),
            x: Math.min(starting.x, ending.x),
            y: Math.min(starting.y, ending.y),
            width: Math.abs(ending.x - starting.x),
            height: Math.abs(ending.y - starting.y),
            ...RECTANGLE_STYLE,
        }
    }

    return { onPointerDown, onPointerMove, onPointerUp, drawPreview };
}