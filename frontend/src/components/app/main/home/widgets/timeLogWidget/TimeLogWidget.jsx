/** React & Third-Party Libraries */
import { useEffect } from "react";
import { createPortal } from "react-dom";

/** Contexts, Hooks & Services */
import { useTimeLogWidgetLogic } from "../../../../../../hooks/components/app/main/home/widgets/timeLogWidget/useTimeLogWidgetLogic.js";

/** Components & Layouts */
import { ScrollingText } from "../../../common/ScrollingText.jsx";
import { TimeLogPopUpComponent } from "./TimeLogPopUpComponent.jsx";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../../../../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../../../../constants/projects_icons.js";
import { formatTimeSegments } from "../../../../../../utils/timeLogUtils.js";

/** Icons */
import { IconEdit, IconTrash, IconCirclePlus, IconPyramid } from "@tabler/icons-react";

/**
 * Weekly Progress TimeLog Widget
 *
 * This purely visual component renders a chronological list of time logs within a 7-day 
 * rolling window. It utilizes minimal local state to manage the active day tab and 
 * delegates data hydration, API interactions, and hierarchical resolutions to its 
 * headless hook (`useTimeLogWidgetLogic`).
 *
 * @component
 * @param {Object} props - The raw widget configuration object injected by the grid layout.
 * @param {Function} setCustomActions - Callback provided by `BaseWidget` to mount custom action buttons (like 'Add') into the widget's header.
 * @returns {JSX.Element} The rendered time log widget.
 */
export const TimeLogWidget = ({ props, setCustomActions }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Time Log Widget Data & Action Handlers
     *
     * Extracts the intelligently merged logs (static backend + real-time global state),
     * header calendar structure, and selection handlers directly from the headless hook.
     */
    const { translations, timeLogWidgetStates, timeLogWidgetData, timeLogWidgetActions } = useTimeLogWidgetLogic({ props });

    const { tHome, tCommon } = translations;
    const { selectedDate, last7Days, logsToDisplay, isPopUpOpen, popUpInitialData } = timeLogWidgetStates;
    const { cascadingOptions } = timeLogWidgetData
    const { setSelectedDate, handleOpenPopUp, handleClosePopUp, handleDeleteTimeLog } = timeLogWidgetActions;

    /**
     * Action Injection Effect
     *
     * Mounts the "Create New Time Log" button into the parent `BaseWidget` header.
     * This allows the widget to maintain clean boundaries while pushing controls up 
     * to the standardized dashboard UI.
     */
    useEffect(() => {
        if (setCustomActions) {
            setCustomActions(
                <div className="flex items-center gap-1">
                    <IconCirclePlus
                        onClick={() => handleOpenPopUp()}
                        className="h-8 w-8 text-quaternary-500 opacity-70 hover:text-quaternary-500 hover:opacity-100 transition-colors duration-200 cursor-pointer"
                    />
                </div>
            );
        }
    }, [setCustomActions, handleOpenPopUp]);

    // --- 2. Render ---

    return (
        <>
            <div className="w-full h-0 min-h-full flex flex-col gap-3 overflow-hidden">
                {/* --- 7 Days Navigation --- */}
                <div className="h-fit flex items-center justify-between gap-[2px] overflow-x-auto hide-scrollbar">
                    {last7Days.map((day) => {
                        const isSelected = selectedDate === day.fullDate;

                        return (
                            <button
                                key={day.fullDate}
                                type="button"
                                onClick={() => setSelectedDate(day.fullDate)}
                                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-300
                                    ${isSelected 
                                        ? "bg-primary-400 text-white shadow-md" 
                                        : "bg-primary text-primary-500 hover:bg-primary-400/20"
                                    }
                                `}
                            >
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                                    {day.dayName}
                                </span>
                                <span className="font-bold tabular-nums">
                                    {day.dayNumber}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* --- Scrollable Logs List --- */}
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
                    {logsToDisplay.length > 0 ? (
                        logsToDisplay.map((log) => {
                            const isActive = log.endTime === null;
                            const LogIcon = PROJECTS_ICONS.find((i) => i.id === log.icon) || PROJECTS_ICONS[0]; 
                            const logColour = PHASE_COLOURS.find((c) => c.id === log.color) || PHASE_COLOURS[0];
                            const { hours, minutes } = formatTimeSegments(log.durationInSeconds);
                            const isTempleModeLog = log.isTempleMode;

                            return (
                                <div 
                                    key={log.timeLogId}
                                    className="relative flex items-center justify-between rounded-xl px-3 py-1"
                                    style={{ backgroundColor: `${logColour.hex}` }}
                                >
                                    {/* Left Section: Time, Icon & Truncated Entity Name */}
                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        
                                        {/* Timer Block */}
                                        <div className="shrink-0 flex items-center justify-center" style={{ color: `${logColour.text}` }}>
                                            {isActive ? (
                                                <div className="flex items-center gap-1.5 font-bold">
                                                    <span className="text-sm font-mono tracking-tighter animate-pulse">
                                                        {hours}:{minutes}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-mono font-bold tracking-tighter">
                                                    {hours}:{minutes}
                                                </span>
                                            )}
                                        </div>

                                        {/* Vertical Separator */}
                                        <div className="shrink-0 w-0.5 h-5 rounded-full bg-opacity-40" style={{ backgroundColor: `${logColour.text}90` }} />

                                        {/* Project Icon & Task Details */}
                                        <div className="flex-1 flex items-center gap-1.5 min-w-0" style={{ color: `${logColour.text}` }}>
                                            <LogIcon.component className="shrink-0 w-5 h-5" />
                                            
                                            <div className="flex-1 min-w-0 mt-0.5">
                                                <ScrollingText text={log.entityName} className="text-sm font-semibold leading-tight" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section: Action Buttons */}
                                    <div className="shrink-0 flex items-center" style={{ color: `${logColour.text}` }}>
                                        {!isTempleModeLog && (
                                            <button 
                                                type="button" 
                                                className="rounded-xl p-1.5 hover:bg-black/10 transition-colors" 
                                                title="Editar registro"
                                                onClick={() => handleOpenPopUp(log)}
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </button>
                                        )}

                                        {isTempleModeLog ? (
                                            <div className="p-1.5">
                                                <IconPyramid className="w-4 h-4" stroke={2.5} />
                                            </div>
                                        ) : (
                                            <button 
                                                type="button" 
                                                className="rounded-xl p-1.5 hover:bg-black/10 transition-colors" 
                                                title="Eliminar registro"
                                                onClick={() => handleDeleteTimeLog(log.timeLogId)}
                                            >
                                                <IconTrash className="w-4 h-4" stroke={2.5} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 opacity-70">
                            <h4 className="text-lg font-bold text-quaternary-700">{tHome("widgets.time_log.no_time_logs.title")}</h4>
                            <p className="text-xs text-primary-500 max-w-[200px] text-center mt-1">
                                {tHome("widgets.time_log.no_time_logs.description")}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {isPopUpOpen && createPortal(
                <TimeLogPopUpComponent 
                    onClose={handleClosePopUp}
                    initialData={popUpInitialData}
                    cascadingOptions={cascadingOptions}
                    selectedDate={selectedDate}
                    tHome={tHome}
                    tCommon={tCommon}
                />,
                document.body
            )}
        </>
    );
};