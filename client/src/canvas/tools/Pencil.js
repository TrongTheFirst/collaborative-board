export const PENCIL_STYLE = {
    roughness: 0.5,
    strokeColor: "#000000",
    strokeWidth: 2,
};

export function drawPencilElement(rc, drawing) {
    const points = drawing.points.map((point) => [
        drawing.x + point.x,
        drawing.y + point.y,
    ]);

    rc.linearPath(points, {
        roughness: drawing.roughness ?? PENCIL_STYLE.roughness,
        stroke: drawing.strokeColor ?? PENCIL_STYLE.strokeColor,
        strokeWidth: drawing.strokeWidth ?? PENCIL_STYLE.strokeWidth,
    });
}

export function createPencilTool(rc) {
    let isDrawing = false;
    let points = [];
    let starting = { x: 0, y: 0 };
    let lastPoint = null;

    function onPointerDown(e) {
        isDrawing = true;
        starting = { x: e.clientX, y: e.clientY };
        lastPoint = { x: e.clientX, y: e.clientY };
        points = [{ x: 0, y: 0 }];
    }

    function onPointerMove(e) {
        if (!isDrawing) return;

        const point = { x: e.clientX, y: e.clientY };

        rc.line(lastPoint.x, lastPoint.y, point.x, point.y, {
            roughness: PENCIL_STYLE.roughness,
            stroke: PENCIL_STYLE.strokeColor,
            strokeWidth: PENCIL_STYLE.strokeWidth,
        });

        lastPoint = point;
        points.push({
            x: point.x - starting.x,
            y: point.y - starting.y,
        });
    }

    function onPointerUp() {
        if (!isDrawing) return null;
        isDrawing = false;
        lastPoint = null;

        if (points.length === 0) return null;

        return {
            type: "freedraw",
            x: starting.x,
            y: starting.y,
            points,
            ...PENCIL_STYLE,
        };
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}