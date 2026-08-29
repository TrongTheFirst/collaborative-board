import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Client} from "@stomp/stompjs";

const SessionContext = createContext(null);

export function SessionProvider({children}) {
    const stompClient = useRef(null);
    const subscription = useRef(null);
    const pendingOnConnectActions = useRef([]);
    const roomCode = useRef(null);
    const clientId = useRef(null);

    const navigate = useNavigate();
    const [sessionConnected, setSessionConnected] = useState(false);

    if (!clientId.current) {
        clientId.current = crypto.randomUUID();
    }

    if(!stompClient.current) {
        stompClient.current = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,

            debug: (message) => {
                console.log("STOMP:", message);
            },

            onConnect: () => {
                console.log("STOMP onConnect called");

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
    }

    // useEffect(() => {
    //     return () => {
    //         console.log("SessionProvider unmounting");
    //
    //         unsubscribe();
    //
    //         if (stompClient.current && stompClient.current.active) {
    //             console.log("Deactivating STOMP client during cleanup");
    //             stompClient.current.deactivate();
    //         }
    //
    //     };
    // }, []);


    function connectToRoom(newRoomCode, onReply, onNewDrawing){
        console.log("Calling connectToRoom...")
        if (!stompClient.current) {
            console.log("Stomp client null. Leaving connectToRoom...")
            return;
        }

        activateClient();

        const sendJoinRequest = () => {
            unsubscribe();

            const replyTopic = `/topic/reply/${clientId.current}`;

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                let { success, error, boardId, elements } = JSON.parse(message.body);
                if (!success) {
                    console.error(error);
                } else {
                    elements = elements.map(element => ({ type: element.type, ...element.elementData }));
                    onReply(boardId, elements);
                    subscribeToRoom(newRoomCode, onNewDrawing);
                    setSessionConnected(true);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/join", { clientId: clientId.current, roomCode: newRoomCode });
        }

        delayOnConnectDo(sendJoinRequest);
    }

    function createRoom(boardId, onNewDrawing) {
        if (!stompClient.current) return;

        activateClient();

        const sendCreateRequest = () => {
            unsubscribe();

            const replyTopic = `/topic/reply/${clientId.current}`;
            console.log(`Subscribed to: `,replyTopic);

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                const { success, roomCode: newRoomCode, error } = JSON.parse(message.body);
                if (!success) {
                    console.log(error);
                } else {
                    subscribeToRoom(newRoomCode, onNewDrawing); // set roomCode.current NOW
                    navigate(`/room/${newRoomCode}`);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/create", { clientId: clientId.current, boardId });
        }

        delayOnConnectDo(sendCreateRequest);
    }

    function subscribeToRoom(newRoomCode, onNewDrawing){
        unsubscribe();
        roomCode.current = newRoomCode;
        const replyTopic = `/topic/room/${newRoomCode}`;

        subscription.current = stompClient.current.subscribe(replyTopic, (message) => {
            const { success, error, element } = JSON.parse(message.body);
            if (!success) {
                console.error(error);
            } else {
                const drawing = { type: element.type, ...element.elementData };
                onNewDrawing(drawing);
            }
        });
    }

    const disconnectFromRoom = () => {
        unsubscribe();
        deactivateClient();
        roomCode.current = null;
        setSessionConnected(false);
        navigate("/");
    };

    function delayOnConnectDo(onConnectFunction){
        console.log(
            "delayOnConnectDo:",
            "connected =", stompClient.current?.connected
        );

        if (stompClient.current.connected) {
            console.log("Already connected, running action");
            onConnectFunction();
        } else {
            console.log("Queueing action");
            pendingOnConnectActions.current.push(onConnectFunction);
        }
    }

    function sendMessage(destination, message){
        stompClient.current.publish({
            destination,
            body: JSON.stringify(message)
        });
    }

    function sendDrawing(boardElement){
        sendMessage(`/app/room/${roomCode.current}`, boardElement);
    }

    function unsubscribe(){
        if (subscription.current) {
            subscription.current.unsubscribe();
            subscription.current = null;
        }
    }

    function activateClient(){
        console.log(
            "activateClient:",
            "active =", stompClient.current?.active,
            "connected =", stompClient.current?.connected
        );

        if (stompClient.current && !stompClient.current.active) {
            console.log("Calling activate()");
            stompClient.current.activate();
        }
    }

    function deactivateClient(){
        if (stompClient.current && stompClient.current.active) {
            stompClient.current.deactivate();
        }
    }

    function inSession(){
        return stompClient.current?.connected && roomCode.current !== null;
    }
    function isInRoom(code){
        return stompClient.current?.connected && roomCode.current === code;
    }

    return (
        <SessionContext.Provider value={{
            inSession,
            isInRoom,
            sessionConnected,
            connectToRoom,
            disconnectFromRoom,
            sendDrawing,
            createRoom
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return  useContext(SessionContext);
}