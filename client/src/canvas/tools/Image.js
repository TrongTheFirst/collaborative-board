const MAX_DIMENSION = 1000;
const JPEG_QUALITY = 0.8;

const imageCache = new Map();

export function drawImageElement(ctx, drawing, onLoad){
    let img = imageCache.get(drawing.clientId);

    if (!img) {
        img = new Image();
        img.onload = () => onLoad?.();
        img.src = drawing.src;
        imageCache.set(drawing.clientId, img);
        return; // not loaded yet; onLoad triggers the redraw once it is
    }

    if (!img.complete) return;

    ctx.save();
    ctx.globalAlpha = drawing.opacity ?? 1;
    ctx.drawImage(img, drawing.x, drawing.y, drawing.width, drawing.height);
    ctx.restore();
}

function loadImage(src){
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export async function encodePastedImage(file){

    const objectUrl = URL.createObjectURL(file);
    const img = await loadImage(objectUrl);

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    //resize image to fit the canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;

    const offCtx = offscreen.getContext("2d");
    offCtx.fillStyle = "#ffffff";
    offCtx.fillRect(0, 0, width, height);
    offCtx.drawImage(img, 0, 0, width, height);

    URL.revokeObjectURL(objectUrl);

    return {
        src: offscreen.toDataURL("image/jpeg", JPEG_QUALITY),
        width,
        height,
    };
}