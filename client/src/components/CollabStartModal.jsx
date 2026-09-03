import { Users, Link2, X } from "lucide-react";
import { useSession } from "../contexts/SessionContext.jsx";
import {useBoard} from "../contexts/BoardContext.jsx"
import { useAuth } from "../contexts/AuthContext.jsx"

function CollabStartModal({ setOpenCollabStartModal, setOpenCollabEndModal }) {
    const { connectToBoard, disconnectFromRoom, createRoom} = useSession();
    const { boardId, setBoardDrawings, removeDrawingByClientId, clearBoard,
            setBoardId, setBoardState} = useBoard();
    const { userId, displayName } = useAuth();

    function handleCollabButton() {
        const onReply = (boardId, fetchedDrawings) => {
            setBoardId(boardId);
            setBoardState(fetchedDrawings);
        }
        const onRoomEnd = (isHost) => {
            disconnectFromRoom();
            if(!isHost){
                clearBoard();
            }
        }
        createRoom(boardId, userId, displayName, {onReply, onNewDrawing:setBoardDrawings, onErase:removeDrawingByClientId, onRoomEnd});
        setOpenCollabEndModal(true);
        setOpenCollabStartModal(false);
    }

    return (
        <div className="modal-base" onClick={() => setOpenCollabStartModal(false)}>
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
                        onClick={() => setOpenCollabStartModal(false)}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                    >
                        <X size={18} strokeWidth={1.75} />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <p className="text-sm leading-relaxed text-gray-600">
                        Start a live session and invite others to work
                        together on the board in real time.
                    </p>

                    <button
                        type="button"
                        onClick={handleCollabButton}
                        className="mt-6 w-full primary-button"
                    >
                        <Link2 size={17} strokeWidth={1.75} />
                        <span>Start Session</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CollabStartModal;