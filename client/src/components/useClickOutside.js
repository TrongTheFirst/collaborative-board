import { useEffect, useRef } from "react";

export function useClickOutside(ref, onClickOutside, enabled = true) {
    const callbackRef = useRef(onClickOutside);
    callbackRef.current = onClickOutside;

    useEffect(() => {
        if (!enabled) return;

        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                callbackRef.current();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [enabled, ref]);
}

