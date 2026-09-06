const CLIPBOARD_PREFIX = "devboard-copy:";
const PASTE_OFFSET = 20;

function handleCopy(selection, e){
    if(!selection?.current) return;
    e.preventDefault();

    const drawing = { ...selection.current, type: CLIPBOARD_PREFIX + selection.current.type };
    e.clipboardData.setData('text/plain', JSON.stringify(drawing));
}

function handlePaste(e, boardId, inSession, sendDrawing, addDrawing, setBoardDrawings, drawingsCountRef){
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;

    let source;
    try {
        source = JSON.parse(text);
    } catch (err) {
        return;
    }

    if(!source.type?.startsWith(CLIPBOARD_PREFIX)) return;

    const realType = source.type.slice(CLIPBOARD_PREFIX.length);
    const dx = e.clientX - source.x;
    const dy = e.clientY - source.y;
    const pasted = {
        ...source,
        clientId: crypto.randomUUID(),
        type: realType,
        x: e.clientX,
        y: e.clientY,
        ...(realType === "line" ? { x2: source.x2 + dx, y2: source.y2 + dy } : {}),
    };

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

export {
    handleCopy,
    handlePaste,
}