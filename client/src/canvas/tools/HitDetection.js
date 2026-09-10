const HIT_RADIUS = 8;

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
        (Math.abs(x - left) <= HIT_RADIUS || Math.abs(x - right) <= HIT_RADIUS);

    const nearTopOrBottom =
        inBetween(x, left, right) &&
        (Math.abs(y - top) <= HIT_RADIUS || Math.abs(y - bottom) <= HIT_RADIUS);

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
        if(dist <= HIT_RADIUS) return true;
    }
    return false;
}

//Line
function hitLine(x,y,drawing){
    const dist = shortestDistanceBetweenPointAndLineSegment({x,y},{x:drawing.x,y:drawing.y},{x:drawing.x2,y:drawing.y2});
    return dist <= HIT_RADIUS;
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

    const tolerance = HIT_RADIUS / Math.min(radiusX, radiusY);
    return Math.abs(dist - 1) <= tolerance;
}

function hitContainer(x,y,image){
    return x>=image.x && y>=image.y
            && x<=image.x+image.width && y <=image.y+image.height;
}

function pointsHitDrawing(x,y,drawing){
    switch (drawing.type) {
        case "freedraw":
            return hitPencil(x,y,drawing);
        case "line":
            return hitLine(x,y,drawing);
        case "rectangle":
            return hitBox(x, y, drawing);
        case "text":
        case "image":
            return hitContainer(x,y,drawing);
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

function getBoundingBox(drawing){
    switch (drawing.type) {
        case "line":
            return {
                x1: Math.min(drawing.x, drawing.x2),
                y1: Math.min(drawing.y, drawing.y2),
                x2: Math.max(drawing.x, drawing.x2),
                y2: Math.max(drawing.y, drawing.y2),
            };
        case "freedraw": {
            const xs = drawing.points.map(p => drawing.x + p.x);
            const ys = drawing.points.map(p => drawing.y + p.y);
            return {
                x1: Math.min(...xs),
                y1: Math.min(...ys),
                x2: Math.max(...xs),
                y2: Math.max(...ys),
            };
        }
        case "ellipse": {
            return {
                x1: drawing.x - drawing.width / 2,
                y1: drawing.y - drawing.height / 2,
                x2: drawing.x + drawing.width / 2,
                y2: drawing.y + drawing.height / 2,
            };
        }
        default: // rectangle, text
            return {
                x1: Math.min(drawing.x, drawing.x + drawing.width),
                y1: Math.min(drawing.y, drawing.y + drawing.height),
                x2: Math.max(drawing.x, drawing.x + drawing.width),
                y2: Math.max(drawing.y, drawing.y + drawing.height),
            };
    }
}

export {
    hitBox,
    hitPencil,
    hitLine,
    hitEllipse,
    pointsHitDrawing,
    segmentHitsDrawing,
    getBoundingBox,
};