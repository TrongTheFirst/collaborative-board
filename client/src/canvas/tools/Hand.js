
export function createHandTool(pan){
    let isDragging = false;
    let lastPos = {x: 0, y: 0};

    function onPointerDown(e){
        isDragging = true;
        lastPos = {x: e.clientX, y: e.clientY};
    }

    function onPointerMove(e){
        if(!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        lastPos = {x: e.clientX, y: e.clientY};
        pan(dx,dy);
    }

    function onPointerUp(e){
        if(!isDragging) return;
        isDragging = false;
        lastPos = null;
        return null;
    }
    return { onPointerDown, onPointerMove, onPointerUp };
}