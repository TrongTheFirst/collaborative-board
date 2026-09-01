import { Hand, MousePointer2, Shapes, Pencil, Type, Eraser, ChevronDown, Trash} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

function Toolbar({ clearDrawings, clearCanvas, deleteAllBoardElements, activeTool, setActiveTool }) {
    const tools = [
        { icon: Hand, label: "Hand", tool: null },
        { icon: MousePointer2, label: "Pointer", tool: null },
        { icon: Pencil, label: "Pencil", tool: "pencil" },
        { icon: Type, label: "Text", tool: "text" },
        { icon: Eraser, label: "Erase", tool: null },
    ];

    const {token} = useAuth();

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
                            disabled={tool === null}
                            className={toolButtonClasses(tool)}

                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <button
                        aria-label="Shape"
                        onClick={() => setActiveTool("rectangle")}
                        className={`gap-0.5 px-2 h-10 art-button ${activeTool === "rectangle" ? "bg-gray-300 text-gray-900" : ""}`}
                    >
                        <Shapes size={18} strokeWidth={1.75} />
                        <ChevronDown size={14} strokeWidth={1.75} />
                    </button>


                    {tools.slice(2,5).map(({ icon: Icon, label, tool }) => (
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
                                deleteAllBoardElements(token);
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