/** Contexts */
import { useTimeTracker } from "../../../../context/TimeTrackerContext";

/** Assets & Icons */
import { IconDatabase, IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerStopFilled } from "@tabler/icons-react";

/** Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours";

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
export const TimeTrackerWidget = ({ colorId = "green-tea" }) => {
    const {
        isActive,
        secs,
        playTimer,
        stopTimer,
        getParsedTime,
        activeColorId, // <--- Importante
        taskName, // <--- Importante
        projectIcon: ProjectIcon, // <--- Importante (renombrado con Mayúscula para usar como componente)
    } = useTimeTracker();

    const effectiveColorId = activeColorId ? activeColorId : colorId;

    const foundColor = PHASE_COLOURS.find((color) => color.id === effectiveColorId) || PHASE_COLOURS;

    const darkColor = foundColor.hex;
    const lightColor = foundColor.light;

    const { hours, minutes, seconds } = getParsedTime(secs);

    return (
        <div className="h-full w-full flex flex-col items-start gap-2">
            <div className="w-full flex items-start justify-between" style={{ color: lightColor }}>
                <div className="flex flex-col items-start text-xl">
                    <span className="font-semibold">{taskName}</span>
                    <span className="font-extralight">Diseñar página de inicio</span>
                </div>

                {ProjectIcon ? (
                    <ProjectIcon className="w-6 h-auto flex-shrink-0" />
                ) : (
                    <IconDatabase className="w-6 h-auto flex-shrink-0 opacity-50" />
                )}
            </div>

            <div className="h-full w-full flex items-center justify-between">
                <div
                    className="h-full flex flex-col items-start justify-center rounded-2xl p-3"
                    style={{ backgroundColor: lightColor, color: darkColor }}
                >
                    <span className="text-3xl font-semibold leading-none tabular-nums">{hours}h</span>
                    <span className="text-2xl font-extralight tracking-wider leading-none tabular-nums">
                        {minutes}:{seconds}
                    </span>
                </div>

                <div className="h-full flex flex-col justify-between" style={{ color: darkColor }}>
                    <button
                        className="flex items-center justify-center rounded-full p-2 transition-transform duration-100 hover:scale-105 cursor-pointer"
                        style={{ backgroundColor: lightColor }}
                        type="button"
                        onClick={() => playTimer()}
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
                        style={{ backgroundColor: lightColor }}
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
