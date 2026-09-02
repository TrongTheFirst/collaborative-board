import { Hand, MousePointer2, Square, Circle, Minus, MoveRight, Pencil, Type, Eraser, ChevronDown, Trash} from "lucide-react";

function Toolbar({ clearDrawings, clearCanvas, deleteAllBoardElements, activeTool, setActiveTool }) {
    const tools = [
        { icon: Hand, label: "Hand", tool: "hand" },
        { icon: MousePointer2, label: "Pointer", tool: "pointer" },
        { icon: Square, label: "Rectangle", tool: "rectangle" },
        { icon: Circle, label: "Ellipse", tool: "ellipse" },
        { icon: Minus, label: "Line", tool: "line" },
        { icon: Pencil, label: "Pencil", tool: "pencil" },
        { icon: Type, label: "Text", tool: "text" },
        { icon: Eraser, label: "Erase", tool: "eraser" },
    ];

    function toolButtonClasses(tool) {
        const isActive = tool !== null && tool === activeTool;
        return `art-button w-10 h-10 ${isActive ? "bg-gray-300 text-gray-900" : ""} ${
            tool === null ? "opacity-40 cursor-not-allowed" : ""
        }`;
    }

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 shadow-sm px-2 py-2 ">
                    {tools.slice(0, 2).map(({ icon: Icon, label, tool }) => (
                        <button
                            key={label}
                            aria-label={label}
                            className={toolButtonClasses(tool)}

                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {tools.slice(2,8).map(({ icon: Icon, label, tool }) => (
                        <button
                            key={label}
                            aria-label={label}
                            onClick={tool ? () => setActiveTool(tool) : undefined}
                            className={toolButtonClasses(tool)}
                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    {tools.slice(8,9).map(({ icon: Icon, label, tool }) => (
                        <button
                            key={label}
                            aria-label={label}
                            onClick={tool ? () => setActiveTool(tool) : undefined}
                            className={toolButtonClasses(tool)}
                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}

                    <div className="group relative">
                        <button
                            aria-label="Trash"
                            className="art-button w-10 h-10 "
                            onClick={() => {
                                clearDrawings();
                                clearCanvas();
                                deleteAllBoardElements();
                            }}
                        >
                            <Trash size={18} strokeWidth={1.75}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Toolbar;