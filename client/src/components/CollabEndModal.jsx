import { useState } from "react";
import { useParams } from "react-router-dom";
import { Users, Link2, X, Copy, Check, Eye } from "lucide-react";
import { useSession } from "../contexts/SessionContext.jsx";
import { useBoard } from "../contexts/BoardContext.jsx"

function CollabEndModal({setOpenCollabEndModal}) {
    const { disconnectFromRoom, isHost, viewMode, sendRuleToggle} = useSession();
    const { clearBoard } = useBoard();
    const { roomCode } = useParams();
    const [copied, setCopied] = useState(false);
    const [view, setView] = useState(false);

    const roomUrl = `${window.location.origin}/room/${roomCode}`;

    function handleCloseButton() {
        if(!isHost()){
            clearBoard();
        }
        disconnectFromRoom();
        setOpenCollabEndModal(false);
    }

    async function handleCopyLink() {
        await navigator.clipboard.writeText(roomUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="modal-base" onClick={() => setOpenCollabEndModal(false)}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                            <Users size={20} strokeWidth={1.75} />
                        </div>

                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                Live Session
                            </h1>

                            <p className="text-sm text-gray-500">
                                Collaborate in real time
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpenCollabEndModal(false)}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                    >
                        <X size={18} strokeWidth={1.75} />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <p className="text-sm leading-relaxed text-gray-600">
                        Share this link to invite others to work together on
                        the board in real time.
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={roomUrl}
                            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            aria-label="Copy link"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
                        >
                            {copied ? (
                                <Check size={16} strokeWidth={1.75} className="text-green-600" />
                            ) : (
                                <Copy size={16} strokeWidth={1.75} />
                            )}
                        </button>
                    </div>

                    {isHost() && (
                        <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                    <Eye size={16} strokeWidth={1.75} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">View only</p>
                                    <p className="text-xs text-gray-500">Others can watch, not draw</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={viewMode}
                                onClick={()=>sendRuleToggle("view",!viewMode)}
                                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
                                    viewMode ? "bg-gray-900" : "bg-gray-200"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                        viewMode ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleCloseButton}
                        className="mt-6 w-full primary-button"
                    >
                        <Link2 size={17} strokeWidth={1.75} />
                        <span>{isHost() ? "Stop Session" : "Leave Session"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CollabEndModal;