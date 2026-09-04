export const TEXT_STYLE = {
    fillStyle: "#000000",
    fontSize: "20px",
    fontStyle: "sans-serif",
    fontWeight: "",
}

export function drawTextElement(ctx, drawing){
    const fontSize = drawing.fontSize ?? TEXT_STYLE.fontSize;
    ctx.fillStyle = drawing.fillStyle ?? TEXT_STYLE.fillStyle;
    ctx.font = `${drawing.fontWeight ?? TEXT_STYLE.fontWeight} ${fontSize} ${drawing.fontStyle ?? TEXT_STYLE.fontStyle}`;

    ctx.fillText(drawing.text, drawing.x, drawing.y);
}

export function commitTextTool(previewCanvas, textArea, box){
    const value = textArea?.value.trim();

    const ctx = previewCanvas.getContext("2d");
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (!value || !box) return null;

    return {
        clientId: crypto.randomUUID(),
        type: "text",
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        text: value,
        ...TEXT_STYLE,
    };
}


const MIN_WIDTH = 60;
const MIN_HEIGHT = 30;


export function createTextTool(previewRc, previewCanvas, onPlace){
    let isWriting = false;
    let starting = {x: 0, y: 0};
    let lastX = 0;
    let textBox = null

    function getTextBox(){
        const x = Math.min(starting.x, lastX);
        const y = starting.y;
        const width = Math.abs(lastX - starting.x) < MIN_WIDTH ? MIN_WIDTH : Math.abs(lastX - starting.x);
        return {x, y, width, height: MIN_HEIGHT};
    }

    function drawPreview() {
        const ctx = previewCanvas.getContext("2d");
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.setLineDash([5,10])

        const { x, y, width, height } = getTextBox();
        previewRc.rectangle(x, y, width, MIN_HEIGHT, {
            roughness: 0.5,
            stoke: 'rgba(255, 255, 255, 0.5)',
            strokeWidth: 2,
            strokeStyle: "dashed",
            roundness: null,
        });
    }

    function onPointerDown(e){
        isWriting = true;
        starting = {x: e.clientX, y: e.clientY};
    }

    function onPointerMove(e){
        if(!isWriting) return;

        lastX = e.clientX;
        drawPreview();
    }

    function onPointerUp(e){
        if(!isWriting) return null;
        isWriting = false;

        onPlace(getTextBox());
        return null;
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}