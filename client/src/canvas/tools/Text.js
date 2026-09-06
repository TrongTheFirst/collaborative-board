export const TEXT_STYLE = {
    fillStyle: "#000000",
    fontSize: "20px",
    fontStyle: "sans-serif",
    fontWeight: "",
}

const MIN_WIDTH = 60;
const MIN_HEIGHT = 30;

function wrapLines(ctx, text, maxWidth){
    const paragraphs = text.split("\n");
    const lines = [];

    paragraphs.forEach(pg => {
        if(pg === ""){
            lines.push("");
            return;
        }

        const words = pg.split(" ");
        let currentLine = "";

        words.forEach((word) => {
            while (ctx.measureText(word).width > maxWidth && word.length > 1) {
                let i = 1;
                while (i < word.length && ctx.measureText(word.slice(0, i)).width <= maxWidth) {
                    i++;
                }
                const chunk = word.slice(0, Math.max(1, i - 1));
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = "";
                }
                lines.push(chunk);
                word = word.slice(chunk.length);
            }
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (currentLine && ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        })
        lines.push(currentLine);
    })
    return lines;
}

export function drawTextElement(ctx, drawing){
    const fontSize = drawing.fontSize ?? TEXT_STYLE.fontSize;
    ctx.fillStyle = drawing.fillStyle ?? TEXT_STYLE.fillStyle;
    ctx.font = `${drawing.fontWeight ?? TEXT_STYLE.fontWeight} ${fontSize} ${drawing.fontStyle ?? TEXT_STYLE.fontStyle}`;
    ctx.textBaseline = "top";

    const maxWidth = drawing.width ?? MIN_WIDTH;
    const lineHeight = parseFloat(fontSize) * 1.3;
    const lines = wrapLines(ctx, drawing.text, maxWidth);

    lines.forEach((line, i) => {
        ctx.fillText(line, drawing.x, drawing.y + i * lineHeight);
    });
}

export function commitTextTool(previewCanvas, textArea, box){
    const value = textArea?.value.trim();

    const ctx = previewCanvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.restore();

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
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.restore();
        ctx.setLineDash([5,10])

        const { x, y, width, height } = getTextBox();
        previewRc.rectangle(x, y, width, MIN_HEIGHT, {
            roughness: 0.5,
            stroke: '#000000',
            strokeWidth: 2,
            strokeStyle: "dashed",
            roundness: null,
        });
        ctx.setLineDash([0])
    }
    function clearPreview(ctx){
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.restore();
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
        clearPreview();
        return null;
    }

    return { onPointerDown, onPointerMove, onPointerUp };
}