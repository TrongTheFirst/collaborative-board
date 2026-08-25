import { Hand, MousePointer2, Shapes, Pencil, Type, Eraser, ChevronDown, Trash} from "lucide-react";

function Toolbar() {
    const tools = [
        { icon: Hand, label: "Hand" },
        { icon: MousePointer2, label: "Pointer" },
        { icon: Pencil, label: "Pencil" },
        { icon: Type, label: "Text" },
        { icon: Eraser, label: "Erase" },
        { icon: Trash, label: "Trash" }
    ];

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 shadow-sm px-2 py-2 ">
                    {tools.slice(0, 2).map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            aria-label={label}
                            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    <button
                        aria-label="Shape"
                        className="flex items-center gap-0.5 justify-center h-10 px-2 rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                        <Shapes size={18} strokeWidth={1.75} />
                        <ChevronDown size={14} strokeWidth={1.75} />
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {tools.slice(2).map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            aria-label={label}
                            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            <Icon size={18} strokeWidth={1.75} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Toolbar;