import { Hand, MousePointer2, Shapes, Pencil, Type, Eraser, ChevronDown, Trash} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

function Toolbar({ clearDrawings, clearCanvas, deleteAllBoardElements}) {
    const tools = [
        { icon: Hand, label: "Hand" },
        { icon: MousePointer2, label: "Pointer" },
        { icon: Pencil, label: "Pencil" },
        { icon: Type, label: "Text" },
        { icon: Eraser, label: "Erase" },
        { icon: Trash, label: "Trash" }
    ];

    const {token} = useAuth();


    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 shadow-sm px-2 py-2 ">
                    {tools.slice(0, 2).map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            aria-label={label}
                            className="art-button w-10 h-10"
                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <button
                        aria-label="Shape"
                        className="gap-0.5 px-2 h-10 art-button"
                    >
                        <Shapes size={18} strokeWidth={1.75} />
                        <ChevronDown size={14} strokeWidth={1.75} />
                    </button>


                    {tools.slice(2,5).map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            aria-label={label}
                            className="art-button w-10 h-10"
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