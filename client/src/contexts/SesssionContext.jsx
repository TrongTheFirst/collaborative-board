import {createContext, useContext, useEffect, useRef, useState} from "react";
import {Client} from "@stomp/stompjs";

const SessionContext = createContext(null);

export function SessionProvider({children}) {
    const stompClient = useRef(null);
    const subscription = useRef(null);

    const [sessionConnected, setSessionConnected] = useState(false);
    const [boardId, setBoardId] = useState(null);

    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,

            onConnect: () => {
                console.log("Connected");
                setSessionConnected(true);
            },

            onDisconnect: () => {
                console.log("Disconnected");
                setSessionConnected(false);
            },

            onStompError: (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
                console.error("Details:", frame.body);
            },

            onWebSocketError: (error) => {
                console.error("WebSocket error:", error);
                setSessionConnected(false);
            }
        });

        stompClient.current = client;

        return () => {
            if (subscription.current) {
                subscription.current.unsubscribe();
                subscription.current = null;
            }

            if (client.active) {
                client.deactivate();
            }

            stompClient.current = null;
        };
    }, []);

    const connectToBoard = (id, onMessage) => {
        if (!stompClient.current) {
            return;
        }

        setBoardId(id);

        if (!stompClient.current.active) {
            stompClient.current.activate();
        }

        const subscribeToBoard = () => {
            if (subscription.current) {//if already in a session, leave that session to join new session
                subscription.current.unsubscribe();
                subscription.current = null;
            }
            console.log(`Subscribed to /topic/board/${id}`)
            subscription.current = stompClient.current.subscribe(
                `/topic/board/${id}`, (message) => {
                    console.log("Received:", message.body);
                    //TODO handle what happens after connecting
                }
            );
        };


        //TODO idk
        if (stompClient.current.connected) {
            subscribeToBoard();
        } else {
            const originalOnConnect = stompClient.current.onConnect;

            stompClient.current.onConnect = (frame) => {
                originalOnConnect(frame);
                subscribeToBoard();
            };
        }
    };

    const disconnectFromBoard = () => {
        if (subscription.current) {
            subscription.current.unsubscribe();
            subscription.current = null;
        }

        if (stompClient.current && stompClient.current.active) {
            stompClient.current.deactivate();
        }

        setBoardId(null);
    };

    const sendMessage = (message, boardId) => {
        if (!stompClient.current || !stompClient.current.connected) {
            // console.error("Cannot send message: STOMP client is not connected");
            return;
        }

        stompClient.current.publish({
            destination: `/app/board/${boardId}`,
            body: JSON.stringify(message)
        });
    };

    return (
        <SessionContext.Provider value={{
            sessionConnected,
            boardId,
            connectToBoard,
            disconnectFromBoard,
            sendMessage
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return  useContext(SessionContext);
}