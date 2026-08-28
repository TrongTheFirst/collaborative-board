import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Client} from "@stomp/stompjs";

const SessionContext = createContext(null);

export function SessionProvider({children}) {
    const stompClient = useRef(null);
    const subscription = useRef(null);
    const pendingOnConnectActions = useRef([]);

    const navigate = useNavigate();

    const [sessionConnected, setSessionConnected] = useState(false);

    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,

            onConnect: () => {
                console.log("Connected");
                setSessionConnected(true);

                const actions = pendingOnConnectActions.current;
                pendingOnConnectActions.current = [];
                actions.forEach((action) => action());
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
            unsubscribe();

            if (client.active) {
                client.deactivate();
            }

            stompClient.current = null;
        };
    }, []);

    const connectToRoom= (roomCode, onMessage) => {
        if (!stompClient.current) {
            return;
        }

        activateClient()

        const subscribeToBoard = () => {
            unsubscribe();
            console.log(`Subscribed to /topic/room/${roomCode}`)
            subscription.current = stompClient.current.subscribe(
                `/topic/board/${roomCode}`, (message) => {
                    console.log("Received:", message.body);
                    //TODO handle what happens after connecting

                }
            );
        };

        delayOnConnectDo(subscribeToBoard);
    };

    const disconnectFromRoom = () => {
        unsubscribe();
        deactivateClient();
        navigate("/");
    };

    function createRoom(boardId) {
        activateClient();

        const sendCreateRequest = () => {
            unsubscribe();

            const clientId = crypto.randomUUID();
            const replyTopic = `/topic/reply/${clientId}`;

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                const roomCode = message.body;
                console.log("Room created:", roomCode);
                replySub.unsubscribe();

                navigate(`/room/${roomCode}`);
            });

            sendMessage("/app/create", { clientId, boardId});
        }

        delayOnConnectDo(sendCreateRequest);
    }

    function delayOnConnectDo(onConnectFunction){
        if (stompClient.current.connected) {
            onConnectFunction();
        } else {
            pendingOnConnectActions.current.push(onConnectFunction);
        }
    }

    function sendMessage(destination, message){
        stompClient.current.publish({
            destination,
            body: JSON.stringify(message)
        });
    }

    function unsubscribe(){
        if (subscription.current) {
            subscription.current.unsubscribe();
            subscription.current = null;
        }
    }

    function activateClient(){
        if (!stompClient.current.active) {
            stompClient.current.activate();
        }
    }

    function deactivateClient(){
        if (stompClient.current && stompClient.current.active) {
            stompClient.current.deactivate();
        }
    }

    function inSession(){
        if(!stompClient.current) return false;
        return stompClient.current.connected;
    }

    return (
        <SessionContext.Provider value={{
            inSession,
            sessionConnected,
            connectToRoom,
            disconnectFromRoom,
            sendMessage,
            createRoom
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return  useContext(SessionContext);
}