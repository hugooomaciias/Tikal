/** React & Third-Party Libraries */
import { createContext, useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";

// 1. Creamos el contexto
const TimeTrackerContext = createContext();

// 2. Creamos el Provider que envolverá nuestra App
export const TimeTrackerProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [secs, setSecs] = useState(0);

    const [activeColorId, setActiveColorId] = useState(null);
    const [projectIcon, setProjectIcon] = useState(null);
    const [taskName, setTaskName] = useState("");

    // Mantenemos la lógica del intervalo aquí de forma global
    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSecs((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const playTimer = () => {
        // Nota: Si solo es pausa (!isActive se vuelve falso), los datos se mantienen.
        setIsActive(!isActive);
    };

    const stopTimer = () => {
        setIsActive(false);
        setSecs(0);
    };

    const getParsedTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        const pad = (num) => String(num).padStart(2, "0");

        return {
            hours: pad(h),
            minutes: pad(m),
            seconds: pad(s),
            hasHours: h > 0,
        };
    };

    const setActiveTask = (colorId, icon, name) => {
        stopTimer();

        setActiveColorId(colorId);
        setProjectIcon(icon);
        setTaskName(name);

        setIsActive(true);
    };

    return (
        <TimeTrackerContext.Provider
            value={{
                isActive,
                secs,
                activeColorId,
                projectIcon,
                taskName,
                playTimer,
                stopTimer,
                getParsedTime,
                setActiveTask,
            }}
        >
            {children}
            <Outlet />
        </TimeTrackerContext.Provider>
    );
};

export const useTimeTracker = () => {
    return useContext(TimeTrackerContext);
};
