import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Client} from "@stomp/stompjs";

const SessionContext = createContext(null);

export function SessionProvider({children}) {
    const stompClient = useRef(null);
    const subscription = useRef(null);
    const roomEndedSubscription = useRef(null);
    const joinRoomSubscription = useRef(null);
    const pendingOnConnectActions = useRef([]);
    const roomCode = useRef(null);
    const clientId = useRef(null);
    const host = useRef(null);
    const sessionDisplayName = useRef(null);
    const [collaborators, setCollaborators] = useState([]);

    const navigate = useNavigate();
    const [sessionConnected, setSessionConnected] = useState(false);

    if (!clientId.current) {
        clientId.current = localStorage.getItem("clientId") || crypto.randomUUID();
        localStorage.setItem("clientId", clientId.current);
    }

    if(!stompClient.current) {
        stompClient.current = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,

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



    function connectToRoom(newRoomCode, onReply, onNewDrawing, onErase, onRoomEnd){
        console.log("Calling connectToRoom...")
        if (!stompClient.current) {
            console.log("Stomp client null. Leaving connectToRoom...")
            return;
        }
        if(host.current){
            return;
        }

        activateClient();

        const sendJoinRequest = () => {
            unsubscribe();

            const replyTopic = `/topic/reply/${clientId.current}`;

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                let { success, errors, boardId, elements, member, members} = JSON.parse(message.body);
                if (!success) {
                    console.error(errors);
                    navigate("/")
                } else {
                    sessionDisplayName.current = member.displayName;
                    setCollaborators(members);
                    elements = elements.map(element => ({ type: element.type, ...element.elementData }));
                    onReply(boardId, elements);
                    subscribeToRoom(newRoomCode, onNewDrawing, onErase, onRoomEnd);
                    setSessionConnected(true);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/room/join", {
                clientId: clientId.current,
                roomCode: newRoomCode,
                roleId: 1,
                joinedAt: Temporal.Now.plainDateTimeISO()
            });
        }

        delayOnConnectDo(sendJoinRequest);
    }

    function createRoom(boardId, displayName, subReq) {
        if (!stompClient.current) return;

        activateClient();

        const sendCreateRequest = () => {
            unsubscribe();

            const replyTopic = `/topic/reply/${clientId.current}`;
            console.log(`Subscribed to: `,replyTopic);

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                const { success, errors, roomCode: newRoomCode, member } = JSON.parse(message.body);
                if (!success) {
                    console.log(error);
                } else {
                    host.current = true;
                    sessionDisplayName.current = member.displayName;
                    setCollaborators((prev)=>[...prev, member]);
                    subscribeToRoom(newRoomCode, subReq.onNewDrawing, subReq.onErase, subReq.onRoomEnd)
                    navigate(`/room/${newRoomCode}`);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/room/create", {
                clientId: clientId.current,
                boardId,
                displayName,
                joinedAt: Temporal.Now.plainDateTimeISO()
            });
        }

        delayOnConnectDo(sendCreateRequest);
    }

    function subscribeToRoom(newRoomCode, onNewDrawing, onErase, onRoomEnd){
        unsubscribe();
        roomCode.current = newRoomCode;
        const replyTopic = `/topic/room/${newRoomCode}`;

        subscription.current = stompClient.current.subscribe(replyTopic, (message) => {
            const { success, type, error, payload } = JSON.parse(message.body);
            if (!success) {
                console.error(error);
            } else if(type === "add"){
                const drawing = { type: payload.type, ...payload.elementData };
                onNewDrawing(drawing);
            }else if(type === "erase"){
                onErase(payload);
            }
        });

        joinRoomSubscription.current = stompClient.current.subscribe(replyTopic+"/joined", (message) => {
            const person = JSON.parse(message.body);
            console.log("new person: ", person);
            if(person){
                setCollaborators((prev)=>[...prev, person]);
            }
        })

        roomEndedSubscription.current = stompClient.current.subscribe(replyTopic+"/ended", (message) => {
            const { success, error } = JSON.parse(message.body);
            if(success && !host.current){
                window.alert("Host ended room");
                onRoomEnd(host.current);
                navigate("/");
            }
        })
    }

    const disconnectFromRoom = () => {
        if(host.current){
            endRoom();
            host.current = false;
        }
        unsubscribe();
        deactivateClient();
        roomCode.current = null;
        setCollaborators([]);
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
    function sendErase(boardId, elementClientId){
        sendMessage(`/app/room/${roomCode.current}/delete`, {boardId, elementClientId});
    }
    function endRoom(){
        sendMessage(`/app/room/end`,{clientId:clientId.current, roomCode:roomCode.current});
    }

    function unsubscribe(){
        if (subscription.current) {
            subscription.current.unsubscribe();
            subscription.current = null;
        }
        if(joinRoomSubscription.current){
            joinRoomSubscription.current.unsubscribe();
            joinRoomSubscription.current = null;
        }
        if (roomEndedSubscription.current) {
            roomEndedSubscription.current.unsubscribe();
            roomEndedSubscription.current = null;
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
    function getClientId(){
        if(clientId.current){
            return clientId.current;
        }
        return null;
    }

    return (
        <SessionContext.Provider value={{
            inSession,
            isInRoom,
            sessionConnected,
            collaborators,
            getClientId,
            connectToRoom,
            disconnectFromRoom,
            sendDrawing,
            sendErase,
            createRoom
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return  useContext(SessionContext);
}