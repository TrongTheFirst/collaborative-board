import { encodePastedImage } from "./Image.js";

const CLIPBOARD_PREFIX = "devboard-copy:";
const PASTE_OFFSET = 20;

function handleCopy(selection, e){
    if(!selection?.current) return;
    e.preventDefault();

    const drawing = { ...selection.current};
    e.clipboardData.setData('text/plain', CLIPBOARD_PREFIX + JSON.stringify(drawing));
}

function savePastedDrawing(pasted, boardId, inSession, sendDrawing, addDrawing, setBoardDrawings, drawingsCountRef){
    const {type, ...elementData} = pasted;
    const boardElement = { elementId: 0, boardId, type, elementData };

    if (inSession()) {
        sendDrawing(boardElement);
    } else {
        addDrawing(boardElement);
        drawingsCountRef.current += 1;
        setBoardDrawings(pasted);
    }
}

async function handlePaste(e, boardId, inSession, sendDrawing, addDrawing, setBoardDrawings, drawingsCountRef){
    const items = e.clipboardData.items;
    if(!items.length) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    for(const item of items){
        if(item.type.startsWith("image/")){
            const file = item.getAsFile();

            const image = await encodePastedImage(file)

            const pasted = {
                clientId: crypto.randomUUID(),
                type: "image",
                x: clientX,
                y: clientY,
                width: image.width,
                height: image.height,
                src: image.src,
                };
            savePastedDrawing(pasted, boardId, inSession, sendDrawing, addDrawing, setBoardDrawings, drawingsCountRef);
        }else if(item.type.startsWith("text/plain")){
            item.getAsString((text)=>{
                if(!text.startsWith(CLIPBOARD_PREFIX)) return;
                text = text.substring(CLIPBOARD_PREFIX.length);

                const source = JSON.parse(text);
                const dx = clientX - source.x;
                const dy = clientY - source.y;
                const pasted = {
                    ...source,
                    clientId: crypto.randomUUID(),
                    x: clientX,
                    y: clientY,
                    ...(source.type === "line" ? { x2: source.x2 + dx, y2: source.y2 + dy } : {}),
                };

                savePastedDrawing(pasted, boardId, inSession, sendDrawing, addDrawing, setBoardDrawings, drawingsCountRef);
            });
        }
    }
}

export {
    handleCopy,
    handlePaste,
}