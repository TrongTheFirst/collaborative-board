import {createContext, useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Client} from "@stomp/stompjs";

const SessionContext = createContext(null);

export function SessionProvider({children}) {
    const stompClient = useRef(null);
    const subscription = useRef(null);
    const roomEndedSubscription = useRef(null);
    const joinRoomSubscription = useRef(null);
    const viewModeSubscription = useRef(null);
    const pendingOnConnectActions = useRef([]);
    const roomCode = useRef(null);
    const clientId = useRef(null);
    const host = useRef(false);
    const sessionDisplayName = useRef(null);
    const [collaborators, setCollaborators] = useState([]);
    const [viewMode, setViewMode] = useState(false);

    const navigate = useNavigate();

    if (!clientId.current) {
        clientId.current = localStorage.getItem("clientId") || crypto.randomUUID();
        localStorage.setItem("clientId", clientId.current);
    }

    if(!stompClient.current) {
        stompClient.current = new Client({
            brokerURL: "ws://localhost:8080/ws",
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            reconnectDelay: 5000,

            onConnect: () => {
                console.log("STOMP onConnect called");

                const actions = pendingOnConnectActions.current;
                pendingOnConnectActions.current = [];

                actions.forEach((action) => action());
            },

            onDisconnect: () => {
                console.log("Disconnected");
            },

            onStompError: (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
                console.error("Details:", frame.body);
            },

            onWebSocketError: (error) => {
                console.error("WebSocket error:", error);
            }
        });
    }



    function connectToRoom(newRoomCode, displayName, onReply, onNewDrawing, onErase, onRoomEnd){
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
                let { success, errors, boardId, viewMode, elements, member, members} = JSON.parse(message.body);
                if (!success) {
                    console.error(errors);
                    onRoomEnd(isHost());
                    navigate("/")
                } else {
                    sessionDisplayName.current = member.displayName;
                    setViewMode(viewMode);
                    host.current = member.roleId === 2;
                    setCollaborators(members);
                    elements = elements.map(element => ({ type: element.type, ...element.elementData }));
                    onReply(boardId, elements);
                    subscribeToRoom(newRoomCode, onNewDrawing, onErase, onRoomEnd);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/room/join", {
                clientId: clientId.current,
                roomCode: newRoomCode,
                displayName,
                roleId: 1,
                joinedAt: Temporal.Now.plainDateTimeISO()
            });
        }

        delayOnConnectDo(sendJoinRequest);
    }

    function createRoom(boardId, userId, displayName, subReq) {
        if (!stompClient.current) return;

        activateClient();

        const sendCreateRequest = () => {
            unsubscribe();

            const replyTopic = `/topic/reply/${clientId.current}`;
            console.log(`Subscribed to: `,replyTopic);

            const replySub = stompClient.current.subscribe(replyTopic, (message) => {
                const { success, errors, member } = JSON.parse(message.body);
                if (!success) {
                    console.log(errors);
                } else {
                    host.current = true;
                    sessionDisplayName.current = member.displayName;
                    setCollaborators((prev)=>[...prev, member]);
                    subscribeToRoom(member.roomCode, subReq.onNewDrawing, subReq.onErase, subReq.onRoomEnd)
                    navigate(`/room/${member.roomCode}`);
                }
                replySub.unsubscribe();
            });

            sendMessage("/app/room/create", {
                clientId: clientId.current,
                boardId,
                displayName,
                joinedAt: Temporal.Now.plainDateTimeISO(),
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
            const {type, member} = JSON.parse(message.body);
            if(type === "join"){
                setCollaborators((prev) => {
                    const exists = prev.some((m) => m.id === member.id);
                    return exists ? prev : [...prev, member];
                });
            }else if(type === "leave"){
                setCollaborators((prev) => {
                    return prev.filter((m) => m.id !== member.id);
                });
            }

        })

        viewModeSubscription.current = stompClient.current.subscribe(replyTopic+"/rules", (message) => {
            const {rule, ruleToggle} = JSON.parse(message.body);
            if(!host.current){
                console.log(`${rule} : ${ruleToggle}`)
                switch(rule){
                    case "view":
                        setViewMode(ruleToggle);
                        break;
                }
            }
        })

        roomEndedSubscription.current = stompClient.current.subscribe(replyTopic+"/ended", (message) => {
            const { success, error } = JSON.parse(message.body);
            if(success && !host.current){
                navigate("/");
                window.alert("Host ended room");
                onRoomEnd(host.current);
            }
        })
    }

    const disconnectFromRoom = () => {
        if(host.current){
            endRoom();
            host.current = false;
        }
        setViewMode(false);
        leaveRoom();
        unsubscribe();
        deactivateClient();
        roomCode.current = null;
        setCollaborators([]);
        pendingOnConnectActions.current = []
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
        if(viewMode && !host.current){
            return;
        }
        sendMessage(`/app/room/${roomCode.current}`, {sender:clientId.current, element:boardElement});
    }
    function sendErase(boardId, elementClientId){
        if(viewMode && !host.current){
            return;
        }
        sendMessage(`/app/room/${roomCode.current}/delete`, {boardId, elementClientId});
    }
    function endRoom(){
        if(!host.current){
            return;
        }
        sendMessage(`/app/room/end`,{clientId:clientId.current, roomCode:roomCode.current});
    }
    function leaveRoom(){
        sendMessage("/app/room/leave", {clientId:clientId.current, roomCode:roomCode.current});
    }
    function sendRuleToggle(rule, ruleToggle){
        if (!host.current) return;
        if(rule === "view"){
            setViewMode(ruleToggle);
        }
        sendMessage(`/app/room/${roomCode.current}/rules`, { clientId: clientId.current, rule, ruleToggle });
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
        if(viewModeSubscription.current){
            viewModeSubscription.current.unsubscribe();
            viewModeSubscription.current = null;
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
            stompClient.current.connectHeaders = {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            };
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
    function isHost(){
        return host.current;
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
            isHost,
            isInRoom,
            collaborators,
            getClientId,
            connectToRoom,
            disconnectFromRoom,
            sendDrawing,
            sendErase,
            createRoom,
            viewMode,
            sendRuleToggle,
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return  useContext(SessionContext);
}