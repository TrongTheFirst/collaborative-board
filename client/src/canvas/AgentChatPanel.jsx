import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Bot } from "lucide-react";
import { useBoard } from "../contexts/BoardContext.jsx";
import {useAuth} from "../contexts/AuthContext.jsx";

function AgentChatPanel({ onClose, messages, setMessages, lastClicked }) {
    const { boardId, fetchBoardElements } = useBoard();
    const { BASE_URL } = useAuth();
    const [input, setInput] = useState("");
    const [posX, setPosX] = useState(100);
    const [posY, setPosY] = useState(100);
    const [doLastClicked, setDoLastClicked] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending]);

    useEffect(()=>{
        if(doLastClicked){
            setPosX(Number(lastClicked.x));
            setPosY(Number(lastClicked.y));
        }
    }, [doLastClicked, lastClicked]);

    async function handleSend(e) {
        e.preventDefault();
        const prompt = input.trim();
        if (!prompt || isSending) return;

        setMessages((prev) => [...prev, { role: "user", text: prompt }]);
        setInput("");
        setIsSending(true);

        if(!Number(posX)){
            setPosX(100);
        }
        if(!Number(posY)){
            setPosY(100);
        }

        try {
            const res = await fetch(BASE_URL+"/agent/draw", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    boardId,
                    prompt,
                    centerX: Number(posX),
                    centerY: Number(posY),
                }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { role: "agent", text: data.summary ?? "Done." }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: "agent", text: "Something went wrong reaching the agent." }]);
        } finally {
            setIsSending(false);
            fetchBoardElements(boardId);
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-20 flex h-[420px] w-80 flex-col rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Bot size={16} strokeWidth={1.75} />
                    <span>Board Agent</span>
                </div>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                    <p className="text-sm text-gray-400">Ask me to draw something on the board.</p>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}
                {isSending && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
                            <Loader2 size={14} className="animate-spin" />
                            <span>Drawing...</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-gray-200 p-3 pb-0">
                <label className="flex items-center gap-1 text-xs text-gray-500">
                    x
                    <input
                        type="number"
                        value={posX}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "-" || Number.isFinite(Number(value))) {
                                setPosX(value);
                            }
                        }}
                        className="w-16 rounded-md border border-gray-300 px-1 py-0.5 text-sm outline-none focus:border-blue-400"
                    />
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-500">
                    y
                    <input
                        type="number"
                        value={posY}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === "-" || Number.isFinite(Number(value))) {
                                setPosY(value);
                            }
                        }}
                        className="w-16 rounded-md border border-gray-300 px-1 py-0.5 text-sm outline-none focus:border-blue-400"
                    />
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-500">
                    Set to last place clicked
                    <input
                        type="checkbox"
                        onChange={(e) => {setDoLastClicked(e.target.checked)}}
                    />
                </label>
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 p-3">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                        }
                        // Shift+Enter: no preventDefault, so the browser inserts the newline normally
                    }}
                    placeholder="Draw a red rectangle..."
                    rows={1}
                    className="flex-1 resize-none rounded-md border border-gray-300 px-2 py-5 text-sm outline-none focus:border-blue-400"
                    disabled={isSending}
                />
                <button type="submit" disabled={isSending || !input.trim()} className="text-blue-500 disabled:text-gray-300">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}

export default AgentChatPanel;