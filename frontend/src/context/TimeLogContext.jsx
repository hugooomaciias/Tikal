/** React & Context */
import { createContext } from "react";

/** Routing & Navigation */
import { Outlet } from "react-router-dom";

/** Components & Layouts */
import { ConfirmTimeLogComponent } from "../components/app/main/common/ConfirmTimeLogComponent.jsx";
import { ConfirmSwitchTaskComponent } from "../components/app/main/common/ConfirmSwitchTaskComponent.jsx";

/** Contexts, Hooks & Services */
import { useTimeLogController } from "../hooks/controllers/time/useTimeLogController.js";
import { useSync } from "../hooks/core/useSync.js";

// eslint-disable-next-line react-refresh/only-export-components
export const TimeLogContext = createContext();

/**
 * Global Time Log Provider Component
 *
 * Acts as the unified domain wrapper for the application's time tracking system.
 * It initializes the core time tracking headless controller (`useTimeLogController`) and 
 * distributes its reactive states and mutation actions throughout the component tree 
 * via Context. Additionally, it globally mounts the confirmation modal for stopping 
 * timers, ensuring it can be triggered from anywhere in the application.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the time log context.
 * @returns {JSX.Element} The time log context provider and global modals.
 */
export const TimeLogProvider = ({ children }) => {
    // --- 1. Initialization & Effects ---

    /**
     * Core Time Tracker Logic
     *
     * Instantiates the headless domain controller responsible for managing the global 
     * timer tick, active task state, and backend synchronization.
     * @type {Object}
     */
    const tracker = useTimeLogController();

    /**
     * Main Context Hook
     *
     * Extracts global application state methods regarding calendar events, tasks, user preferences,
     * and overarching loading status from the synchronized backend payload.
     */
    const { fetchTempleModeGamificationUpdate } = useSync();

    /**
     * Extracted States and Actions
     *
     * Separates the controller's payload into reactive data (states) and 
     * executable functions (actions) for structured consumption by child components.
     */
    const { trackerStates, trackerActions } = tracker;

    // --- 2. Context Provider ---

    return (
        <TimeLogContext.Provider value={{ trackerStates, trackerActions }}>
            {children}
            <Outlet />
            
            <ConfirmTimeLogComponent
                showStopModal={trackerStates.showStopModal}
                activityDescription={trackerStates.activityDescription}
                setActivityDescription={trackerActions.setActivityDescription}
                cancelStopTimer={() => trackerActions.setShowStopModal(false)}
                confirmStopTimer={trackerActions.handleConfirmStop}
                taskName={trackerStates.activeWidgetData?.entityName || ""}
                colorId={trackerStates.activeWidgetData?.colour}
                projectIcon={trackerStates.activeWidgetData?.logo}
                updateGamificationEvents={fetchTempleModeGamificationUpdate}
            />

            {trackerStates.showSwitchModal && (
                <ConfirmSwitchTaskComponent
                    pendingSwitchTask={trackerStates.pendingSwitchTask}
                    taskName={trackerStates.activeWidgetData?.entityName || ""}
                    projectIcon={trackerStates.activeWidgetData?.logo}
                    activeColorId={trackerStates.activeWidgetData?.colour}
                    cancelSwitchTask={trackerActions.cancelSwitchTask}
                    confirmSwitchTask={trackerActions.confirmSwitchTask}
                    activityDescription={trackerStates.activityDescription}
                    setActivityDescription={trackerActions.setActivityDescription}
                />
            )}
        </TimeLogContext.Provider>
    );
};