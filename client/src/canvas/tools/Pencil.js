export const PENCIL_STYLE = {
    roughness: 0,
    strokeColor: "#000000",
    strokeWidth: 2,
    seed: Math.floor(Math.random() * 2 ** 31),
    simplification: 0.6,
};


//Laplacian smoothing
function smoothPoints(points, strength = 0.25) {
    if (points.length < 3) return points;

    const smoothed = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const current = points[i];
        const next = points[i + 1];

        smoothed.push({
            x: current.x + ((prev.x + next.x) / 2 - current.x) * strength,
            y: current.y + ((prev.y + next.y) / 2 - current.y) * strength,
        });
    }

    smoothed.push(points[points.length - 1]);
    return smoothed;
}


function drawSmoothPencilPath(rc, absolutePoints, options){
    rc.ctx.lineCap = "round";
    rc.ctx.lineJoin = "round";

    rc.linearPath(absolutePoints, {
        ...options,
        simplification: PENCIL_STYLE.simplification,
    });

    rc.ctx.lineCap = "butt";
    rc.ctx.lineJoin = "miter";
}

export function drawPencilElement(rc, drawing) {
    if (!drawing.points || drawing.points.length < 2) return;

    const smoothed = smoothPoints(drawing.points);
    const absolutePoints = smoothed.map((p) => [
        drawing.x + p.x,
        drawing.y + p.y,
    ]);

    drawSmoothPencilPath(rc, absolutePoints, {
        roughness: drawing.roughness ?? PENCIL_STYLE.roughness,
        stroke: drawing.strokeColor ?? PENCIL_STYLE.strokeColor,
        strokeWidth: drawing.strokeWidth ?? PENCIL_STYLE.strokeWidth,
        seed: drawing.seed ?? PENCIL_STYLE.seed,
    });
}

const MIN_POINT_DISTANCE = 4;
export function createPencilTool(previewRc, previewCanvas) {
    let isDrawing = false;
    let points = [];
    let starting = { x: 0, y: 0 };

    function drawPreview() {
        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        if (points.length < 2) return;

        const smoothed = smoothPoints(points);
        const absolutePoints = smoothed.map((p) => [
            starting.x + p.x,
            starting.y + p.y,
        ]);

        drawSmoothPencilPath(previewRc, absolutePoints, {
            roughness: PENCIL_STYLE.roughness,
            stroke: PENCIL_STYLE.strokeColor,
            strokeWidth: PENCIL_STYLE.strokeWidth,
        });
    }

    function onPointerDown(e) {
        isDrawing = true;
        starting = { x: e.clientX, y: e.clientY };
        points = [{ x: 0, y: 0 }];
    }

    function onPointerMove(e) {
        if (!isDrawing) return;

        const point = {
            x: e.clientX - starting.x,
            y: e.clientY - starting.y,
        };
        //dont record every point to avoid choppiness
        const last = points[points.length - 1];
        const dx = point.x - last.x;
        const dy = point.y - last.y;
        if (dx * dx + dy * dy < (MIN_POINT_DISTANCE**2)) return;

        points.push(point);
        drawPreview();
    }

    function onPointerUp() {
        if (!isDrawing) return null;
        isDrawing = false;

        if (points.length < 2) {
            points = [];
            return null;
        }

        const drawing = {
            clientId: crypto.randomUUID(),
            type: "freedraw",
            x: starting.x,
            y: starting.y,
            points,
            seed: Math.floor(Math.random() * 2 ** 31),
            ...PENCIL_STYLE,
        };

        points = [];
        return drawing;
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}