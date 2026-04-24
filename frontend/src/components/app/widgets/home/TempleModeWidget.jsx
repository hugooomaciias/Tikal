/** Assets & Icons */
import { IconPlayerPlayFilled } from "@tabler/icons-react";

const RANK_OPTIONS = {
    1: {
        name: "text-primary-50/80",
        primary: "bg-primary-300",
        secondary: "bg-primary-50/80",
        border: "group-hover:border-primary-300",
    },
    2: {
        name: "text-secondary-50/80",
        primary: "bg-secondary-400",
        secondary: "bg-secondary-50/80",
        border: "group-hover:border-secondary-400",
    },
    3: {
        name: "text-tertiary-50/80",
        primary: "bg-tertiary-400",
        secondary: "bg-tertiary-50/80",
        border: "group-hover:border-tertiary-400",
    },
    4: {
        name: "text-red-50/80",
        primary: "bg-red-400",
        secondary: "bg-red-100/80",
        border: "group-hover:border-red-400",
    },
};

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
export const TempleModeWidget = ({ props }) => {
    const rank = props.rank;
    const rank_options = RANK_OPTIONS[rank] || RANK_OPTIONS[1];

    if (!props) return null;

    return (
        <div className="h-full w-full flex flex-col justify-end gap-3">
            <p className={`${rank_options.name} font-passero font-semibold tracking-[0.4em] uppercase`}>Nombre Rango</p>
            <div className="flex items-center gap-6">
                {/* Visualización de Tiempo */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-quaternary-50 tracking-tighter">
                            {props.defaultFocusSessionMinutes}
                        </span>
                        <span className="text-2xl font-light text-quaternary-200">min</span>
                    </div>
                    <div className={`h-1.5 w-full ${rank_options.secondary} rounded-full mt-2 overflow-hidden`}>
                        <div
                            className={`h-full ${rank_options.primary} transition-all duration-500 ease-out`}
                            style={{ width: `${props.rankPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Divisor "Maya" (Patrón de puntos/líneas) */}
                <div className="flex flex-col gap-[6px]">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-sm rotate-45 ${i < rank ? rank_options.primary : rank_options.secondary}`}
                        />
                    ))}
                </div>

                {/* Botón de Acción Principal */}
                <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-quaternary-700 to-quaternary-900 border-2 border-quaternary-500/50 flex items-center justify-center p-2 group transition-all ${rank_options.border}`}
                >
                    <div
                        className={`w-full h-full bg-quaternary-200`}
                        style={{
                            maskImage: 'url("/icons/rank2Icon.svg")',
                            WebkitMaskImage: 'url("/icons/rank2Icon.svg")',
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TempleModeWidget;
