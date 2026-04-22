/** Contexts */
import { useTimeTracker } from "../../../../context/TimeTrackerContext";

/** Assets & Icons */
import { ScrollingText } from "../../common/ScrollingText";
import { IconDatabase, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled } from "@tabler/icons-react";

/** Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours";
import { PROJECTS_ICONS } from "../../../../constants/projects_icons";

/**
 * Time Tracker Widget
 *
 * This component renders a widget for tracking time spent on specific tasks.
 * It displays the current task name, associated project, logged time,
 * and controls (play/stop) to manage the timer.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} [props.className] - Additional CSS classes applied to the rootc  element for custom styling.
 * @returns {JSX.Element} The rendered time tracker widget.
 */
export const TimeTrackerWidget = () => {
    const { isActive, secs, toggleTimer, stopTimer, getParsedTime, activeColorId, taskName, subtaskName, projectIcon } =
        useTimeTracker();

    const displayTaskName = taskName || "Sin tarea seleccionada";
    const displaySubTaskName = subtaskName || "Pulsa en una tarea para comenzar a medir";
    const DisplayIcon = projectIcon || IconDatabase;

    const foundColor = PHASE_COLOURS.find((c) => c.id === activeColorId || c.hex === activeColorId);
    const colors = foundColor
        ? { dark: foundColor.hex, light: foundColor.light }
        : { dark: "#2F6C4B", light: "#BDDDC7" };

    const { hours, minutes, seconds } = getParsedTime(secs);

    return (
        <div className="h-full w-full flex flex-col items-start gap-2">
            <div className="w-full flex items-start justify-between gap-2" style={{ color: colors.light }}>
                <div className="min-w-0 flex flex-1 flex-col items-start text-xl">
                    <ScrollingText text={displayTaskName} className="font-semibold" />
                    <ScrollingText text={displaySubTaskName} className="font-extralight" />
                </div>

                <div className="pr-1 rounded-xl shrink-0" style={{ backgroundColor: `${colors.dark}15` }}>
                    <DisplayIcon className="w-6 h-6" />
                </div>
            </div>

            <div className="h-full w-full flex items-center justify-between">
                <div
                    className="h-full flex flex-col items-start justify-center rounded-2xl p-3"
                    style={{ backgroundColor: colors.light, color: colors.dark }}
                >
                    <span className="text-3xl font-semibold leading-none tabular-nums">{hours}h</span>
                    <span className="text-2xl font-extralight tracking-wider leading-none tabular-nums">
                        {minutes}:{seconds}
                    </span>
                </div>

                <div className="h-full flex flex-col justify-between">
                    <button
                        className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: colors.light, color: colors.dark }}
                        type="button"
                        onClick={() => toggleTimer()}
                    >
                        {isActive ? (
                            <IconPlayerPauseFilled className="w-full h-full" />
                        ) : (
                            <IconPlayerPlayFilled className="w-full h-full" />
                        )}
                    </button>

                    <button
                        type="button"
                        className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: colors.light, color: colors.dark }}
                        onClick={stopTimer}
                    >
                        <IconPlayerStopFilled className="w-full h-full" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeTrackerWidget;
