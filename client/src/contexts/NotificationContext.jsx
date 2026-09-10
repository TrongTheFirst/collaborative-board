import { createContext, useCallback, useContext, useRef, useState } from "react";

const NotificationContext = createContext(null);
const MAX_VISIBLE_NOTIFS = 5;

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const notifQueue = useRef([]);

    const showNotif = useCallback((message, isError=true) => {
        setNotifications((prev) => {
            const alreadyShowing = prev.some((n) => n.message === message);
            const alreadyQueued = notifQueue.current.some((n) => n.message === message);
            if (alreadyShowing || alreadyQueued) {
                return prev;
            }

            const notifObj = { id: crypto.randomUUID(), message, isError};
            if (prev.length < MAX_VISIBLE_NOTIFS) {
                return [...prev, notifObj];
            }
            notifQueue.current.push(notifObj);
            return prev;
        });
    }, []);

    const dismissNotif = useCallback((id) => {
        setNotifications((prev) => {
            const next = prev.filter((e) => e.id !== id);
            if (notifQueue.current.length > 0 && next.length < MAX_VISIBLE_NOTIFS) {
                next.push(notifQueue.current.shift());
            }
            return next;
        });
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            dismissNotif,
            showNotif,
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotif(){
    return useContext(NotificationContext);
}