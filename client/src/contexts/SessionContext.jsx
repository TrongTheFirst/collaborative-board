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
    if (!clientId.current) {
        clientId.current = crypto.randomUUID();
    }

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

    function connectToRoom(newRoomCode, onReply, onNewDrawing){
        if (!stompClient.current) {
            return;
        }

        activateClient()

        const sendJoinRequest = () => {
            unsubscribe();

            const replyTopic = `/topic/reply/${clientId.current}`;

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                //TODO handle what happens after connecting
                let { success, error, boardId, elements  } = JSON.parse(message.body);
                if(!success){
                    console.error(error);
                }else{
                    elements = elements.map(element => ({ type: element.type, ...element.elementData }));
                    onReply(boardId, elements);
                    delayOnConnectDo(subscribeToBoard);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/join", { clientId: clientId.current, roomCode:newRoomCode });
        }

        const subscribeToBoard = () => {
            unsubscribe();
            roomCode.current = newRoomCode;
            const replyTopic = `/topic/room/${newRoomCode}`;

            console.log(`Subscribed to ${replyTopic}`);
            subscription.current = stompClient.current.subscribe(
                replyTopic, (message) => {
                    console.log("received drawing")
                    const { success, error, element} = JSON.parse(message.body);
                    if(!success){
                        console.error(error);
                    }else{
                        const drawing = { type: element.type, ...element.elementData };
                        onNewDrawing(drawing);
                    }
                }
            );
        };

        delayOnConnectDo(sendJoinRequest);
    };

    function createRoom(boardId) {
        activateClient();

        const sendCreateRequest = () => {
            unsubscribe();

            const replyTopic = `/topic/reply/${clientId.current}`;

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                const { success, roomCode, error } = JSON.parse(message.body);
                if (!success) {
                    console.log(error);
                } else {
                    navigate(`/room/${roomCode}`);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/create", { clientId: clientId.current, boardId});
        }

        delayOnConnectDo(sendCreateRequest);
    }

    const disconnectFromRoom = () => {
        unsubscribe();
        deactivateClient();
        roomCode.current = null;
        setSessionConnected(false);
        navigate("/");
    };

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