/** React & Third-Party Libraries */
import { createContext, useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";

import { PROJECTS_ICONS } from "../constants/projects_icons";
import { IconDatabase } from "@tabler/icons-react";
import { useMain } from "../hooks/useMain.js";

// 1. Creamos el contexto
const TimeTrackerContext = createContext();

// 2. Creamos el Provider que envolverá nuestra App
export const TimeTrackerProvider = ({ children }) => {
    const { getHomeWidgetsData, isDataLoaded } = useMain();
    const initialData = getHomeWidgetsData();

    const [hasInitialized, setHasInitialized] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [secs, setSecs] = useState(0);

    const [taskId, setTaskId] = useState(null);
    const [activeColorId, setActiveColorId] = useState(null);
    const [projectIcon, setProjectIcon] = useState(null);
    const [taskName, setTaskName] = useState("");
    const [subTaskName, setSubTaskName] = useState(null);

    useEffect(() => {
        // Solo inicializamos si no hay nada corriendo y tenemos datos del backend
        if (!hasInitialized && initialData?.timeTrackerWidget) {
            const data = initialData.timeTrackerWidget;

            setTaskId(data.taskId);
            setTaskName(data.taskName);
            setSubTaskName(data.projectOrPhaseName);
            setActiveColorId(data.parentColor);

            if (data.accumulatedSeconds > 0) {
                setSecs(data.accumulatedSeconds);
            }

            // Normalizamos el icono del backend
            if (data.projectLogoIcon) {
                const projectLogoIcon = data.projectLogoIcon;
                const iconObj = PROJECTS_ICONS.find((i) => i.id === projectLogoIcon);
                setProjectIcon(() => (iconObj ? iconObj.component : IconDatabase));
            }

            setHasInitialized(true);
        }
    }, [initialData, hasInitialized]);

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

    const playTimer = () => setIsActive(!isActive);

    const stopTimer = () => {
        setIsActive(false);
        setSecs(0);
    };

    const toggleTimer = () => setIsActive(!isActive);

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

    const setActiveTask = (newTaskId, colorHex, IconComp, newTaskName, newSubTaskName) => {
        if (isActive) {
            setIsActive(false);
        }

        setTaskId(newTaskId);
        setActiveColorId(colorHex);
        setProjectIcon(() => IconComp);
        setTaskName(newTaskName);
        setSubTaskName(newSubTaskName || "Tarea individual");

        setSecs(0);
        setIsActive(true);
    };

    if (!isDataLoaded || initialData.length === 0) {
        return null;
    }

    return (
        <TimeTrackerContext.Provider
            value={{
                isActive,
                secs,
                activeColorId,
                projectIcon,
                taskName,
                subTaskName,
                taskId,
                playTimer,
                stopTimer,
                toggleTimer,
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
