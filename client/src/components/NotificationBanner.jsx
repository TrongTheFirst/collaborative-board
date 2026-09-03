import { useEffect } from "react";
import { AlertCircle, X, Info} from "lucide-react";
import { useNotif } from "../contexts/NotificationContext.jsx";

function MessageToast({ notif, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(notif.id), 5000);
        return () => clearTimeout(timer);
    }, [notif.id, onDismiss]);

    return (
        notif.isError ?
            <div
                className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 shadow-sm pointer-events-auto">
                <AlertCircle size={16} strokeWidth={1.75} className="text-red-500 shrink-0"/>
                <span className="text-sm text-red-600">{notif.message}</span>
                <button
                    type="button"
                    onClick={() => onDismiss(notif.id)}
                    aria-label="Dismiss"
                    className="ml-1 text-red-400 hover:text-red-600 cursor-pointer"
                >
                    <X size={14} strokeWidth={2}/>
                </button>
            </div> :
            <div
                className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3.5 py-2.5 shadow-sm pointer-events-auto">
                <AlertCircle size={16} strokeWidth={1.75} className="text-green-500 shrink-0"/>
                <span className="text-sm text-green-600">{notif.message}</span>
                <button
                    type="button"
                    onClick={() => onDismiss(notif.id)}
                    aria-label="Dismiss"
                    className="ml-1 text-green-400 hover:text-green-600 cursor-pointer"
                >
                    <X size={14} strokeWidth={2}/>
                </button>
            </div>
    );
}

function NotificationBanner() {
    const { notifications, dismissNotif } = useNotif();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed z-20 inset-x-0 top-24 flex flex-col items-end gap-2 pr-10 pointer-events-none">
            {notifications.map((notif) => (
                <MessageToast key={notif.id}  notif={notif} onDismiss={dismissNotif} />
            ))}
        </div>
    );
}

export default NotificationBanner;