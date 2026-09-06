import { Hand, MousePointer2, Square, Circle, Minus, MoveRight, Pencil, Type, Eraser, ChevronDown, Trash} from "lucide-react";
import { useSession } from "../contexts/SessionContext.jsx";

function Toolbar({ clearDrawings, clearCanvas, deleteAllBoardElements, activeTool, setActiveTool }) {
    const tools = [
        { icon: Hand, label: "Hand", tool: "hand", hotkey: " - H"},
        { icon: MousePointer2, label: "Select", tool: "select", hotkey: " - S" },
        { icon: Square, label: "Rectangle", tool: "rectangle", hotkey: "" },
        { icon: Circle, label: "Ellipse", tool: "ellipse", hotkey: "" },
        { icon: Minus, label: "Line", tool: "line", hotkey: "" },
        { icon: Pencil, label: "Pencil", tool: "pencil", hotkey: "" },
        { icon: Type, label: "Text", tool: "text", hotkey: "" },
        { icon: Eraser, label: "Erase", tool: "eraser", hotkey: " - E" },
    ];
    const { viewMode, isHost, inSession} = useSession();

    function toolButtonClasses(tool) {
        const isActive = tool !== null && tool === activeTool;
        return `art-button w-10 h-10 ${isActive ? "bg-gray-300 text-gray-900" : ""} ${
            tool === null ? "opacity-40 cursor-not-allowed" : ""
        } ${viewMode && !isHost() ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}`;
    }

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 shadow-sm px-2 py-2 ">
                    {tools.slice(0, 2).map(({ icon: Icon, label, tool, hotkey }) => (
                        <button
                            key={label}
                            aria-label={label}
                            title={label + hotkey}
                            disabled={viewMode && !isHost()}
                            onClick={tool ? () => setActiveTool(tool) : undefined}
                            className={toolButtonClasses(tool)}

                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {tools.slice(2,8).map(({ icon: Icon, label, tool, hotkey }) => (
                        <button
                            key={label}
                            aria-label={label}
                            title={label + hotkey}
                            disabled={viewMode && !isHost()}
                            onClick={tool ? () => setActiveTool(tool) : undefined}
                            className={toolButtonClasses(tool)}
                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    {tools.slice(8,9).map(({ icon: Icon, label, tool, hotkey}) => (
                        <button
                            key={label}
                            aria-label={label}
                            title={label + hotkey}
                            disabled={viewMode && !isHost()}
                            onClick={tool ? () => setActiveTool(tool) : undefined}
                            className={toolButtonClasses(tool)}
                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}

                    <div className="group relative">
                        <button
                            aria-label="Trash"
                            title={"Clear board"}
                            disabled={inSession()}
                            className={`art-button w-10 h-10 ${inSession() ? "opacity-40 cursor-not-allowed hover:bg-transparent":""}`}
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