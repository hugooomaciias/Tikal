/** React & Third-Party Libraries */
import { useState } from "react";

/** Contexts */
import { useTimeTracker } from "../../../context/TimeTrackerContext";

/** Assets & Icons */
import {
    IconLayoutKanban,
    IconLayoutKanbanFilled,
    IconPlusFilled,
    IconEditFilled,
    IconSquareRoundedXFilled,
    IconSquareRoundedCheckFilled,
    IconSquareRoundedPlus,
    IconPlayerPlayFilled,
    IconPlayerPauseFilled,
    IconPlayerStopFilled,
} from "@tabler/icons-react";

/** Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";

/**
 * Application Header Component
 *
 * A dynamic, contextual header that renders different action buttons depending on the active view.
 * It manages page-specific layout toggles, entity creation triggers, and specialized edit modes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.page - The current active page title, localized (e.g., "Tasks", "Calendar").
 * @param {boolean} props.get1 - Primary state flag (e.g., Kanban mode active, Edit mode active, etc.).
 * @param {boolean} props.get2 - Secondary state flag (e.g., Unsaved changes pending in edit mode).
 * @param {Function} props.set1 - Setter function for the primary state flag.
 * @param {Function} props.set2 - Setter function for the secondary state flag.
 * @param {Function} props.t - The i18n translation function.
 * @returns {JSX.Element} The rendered header component.
 */
export const HeaderComponent = ({ page, get1, get2, set1, set2, t }) => {
    const {
        isActive,
        secs,
        activeColorId,
        projectIcon: ProjectIcon,
        taskName,
        toggleTimer,
        stopTimer,
        getParsedTime,
    } = useTimeTracker();

    const [isTrackerExpanded, setIsTrackerExpanded] = useState(false);

    const getIslandColors = () => {
        if (!activeColorId) return { dark: "#2F6C4B", light: "#BDDDC7" }; // Fallback verde tikal

        const foundColor = PHASE_COLOURS.find((c) => c.id === activeColorId || c.hex === activeColorId);

        if (foundColor) {
            return { dark: foundColor.hex, light: foundColor.light };
        }

        // Si el backend envía un Hex que no está en la constante, lo aplicamos directamente
        return { dark: activeColorId, light: "#F1F8F3" };
    };

    const { dark: darkColor, light: lightColor } = getIslandColors();

    const { hours, minutes, seconds, hasHours } = getParsedTime(secs);
    const headerTimeString = hasHours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;

    return (
        <div className="flex items-center justify-between">
            {/* Page Title Wrapper */}
            <div className="h-full w-fit flex items-center gap-4 rounded-full">
                <div className="h-full w-fit bg-primary flex items-center px-5 py-3 rounded-full shadow-md">
                    <h2 className="text-2xl text-primary-600 font-bold">{page}</h2>
                </div>

                {/* Time Tracker Island */}
                {(isActive || secs > 0) && (
                    <div
                        className={`w-fit flex items-center rounded-full shadow-sm transition-all duration-300 ease-out overflow-hidden p-2 ${
                            isTrackerExpanded ? "max-w-[400px] px-4" : "max-w-[120px] px-4 cursor-pointer"
                        }`}
                        style={{ backgroundColor: darkColor, color: lightColor }}
                        onMouseEnter={() => setIsTrackerExpanded(true)}
                        onMouseLeave={() => setIsTrackerExpanded(false)}
                        onClick={() => setIsTrackerExpanded(true)} // Para móviles
                    >
                        {/* Indicador y Tiempo (Siempre visible) */}
                        <div className="flex items-center justify-center gap-3 min-w-max">
                            {/* Renderizamos el componente del icono si existe, sino un fallback */}
                            {ProjectIcon ? (
                                <ProjectIcon className="w-5 h-5" style={{ color: lightColor }} />
                            ) : (
                                <IconPlayerPlayFilled className="w-5 h-5 animate-pulse" style={{ color: lightColor }} />
                            )}
                            <span className="font-semibold mt-[1px] tabular-nums leading-none">{headerTimeString}</span>
                        </div>

                        {/* Contenido Expandido (Nombre + Controles) */}
                        <div
                            className={`flex items-center gap-3 transition-opacity duration-300 ${
                                isTrackerExpanded ? "opacity-100 ml-4 delay-100" : "opacity-0 ml-0 pointer-events-none"
                            }`}
                        >
                            {/* Separador */}
                            <div className="w-px h-6 bg-secondary opacity-50"></div>

                            {/* Nombre de la tarea real */}
                            <span className="text-sm font-medium truncate max-w-[120px]">
                                {taskName || "Sin nombre..."}
                            </span>

                            {/* Controles Reales */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation(); // Evita que se dispare el onClick del contenedor padre
                                    toggleTimer();
                                }}
                                className="p-1.5 rounded-full transition-transform duration-100 hover:scale-105"
                                style={{ backgroundColor: lightColor, color: darkColor }}
                            >
                                {/* Alternamos icono según estado */}
                                {isActive ? (
                                    <IconPlayerPauseFilled className="w-5 h-5" />
                                ) : (
                                    <IconPlayerPlayFilled className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    stopTimer();
                                    setIsTrackerExpanded(false); // Colapsamos al detener
                                }}
                                className="p-1.5 rounded-full transition-transform duration-100 hover:scale-105 hover:text-red-600"
                                style={{ backgroundColor: lightColor, color: darkColor }}
                            >
                                <IconPlayerStopFilled className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Contextual Action Bar */}
            <div className="h-full w-fit flex items-center gap-4 rounded-full">
                {/* -------------------- Tasks Action -------------------- */}
                {page === t("tasks_title") && (
                    <button
                        type="button"
                        className={`h-fit w-fit ${get1 ? "bg-primary-600" : "bg-primary"} p-2 rounded-full shadow-md`}
                        onClick={() => set1(!get1)}
                    >
                        {!get1 ? (
                            <IconLayoutKanban className="w-8 h-8 text-primary-600" />
                        ) : (
                            <IconLayoutKanbanFilled className="w-8 h-8 text-primary" />
                        )}
                    </button>
                )}

                {/* ------------------- Calendar Action ------------------ */}
                {page === t("calendar_title") && (
                    <button
                        type="button"
                        className="h-fit w-fit bg-primary text-primary-600 hover:bg-primary-600 hover:text-primary p-2 rounded-full shadow-md transition-colors duration-200"
                        onClick={() => set1(!get1)}
                    >
                        <IconPlusFilled className="w-8 h-8" />
                    </button>
                )}

                {/* ------------------ Statistics Action ----------------- */}
                {page === t("statistics_title") && (
                    <button
                        type="button"
                        className={`relative flex items-center justify-center overflow-hidden h-12 rounded-full shadow-md transition-all duration-300 ease-in-out ${
                            get1
                                ? "bg-primary-600 text-primary w-[96px]"
                                : "bg-primary text-primary-600 hover:bg-primary-600 hover:text-primary w-12"
                        }`}
                    >
                        {/* Edit Button (Visible when NOT editing) */}
                        <div
                            className={`absolute flex items-center justify-center transition-all duration-300 w-full h-full cursor-pointer
                                ${!get1 ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}
                            `}
                            onClick={() => {
                                set1(true);
                                set2(false);
                            }}
                        >
                            <IconEditFilled className="w-8 h-8" />
                        </div>

                        {/* Action Bar (Visible when Editing) */}
                        <div
                            className={`absolute flex items-center justify-center gap-2 transition-all duration-300 w-full h-full px-2
                                ${get1 ? "opacity-100 scale-100" : "opacity-0 scale-150 pointer-events-none"}
                            `}
                        >
                            {/* Icono de Cancelar / Guardar */}
                            <div className="cursor-pointer transition-transform" onClick={() => set1(false)}>
                                {!get2 ? (
                                    <IconSquareRoundedXFilled className="w-8 h-8" />
                                ) : (
                                    <IconSquareRoundedCheckFilled className="w-8 h-8" />
                                )}
                            </div>

                            {/* Additional Tool */}
                            <div className="cursor-pointer transition-transform">
                                <IconSquareRoundedPlus className="w-8 h-8" />
                            </div>
                        </div>
                    </button>
                )}

                <button className="h-fit w-fit bg-primary p-3 rounded-full shadow-md">
                    <img className="w-10 h-10" src="/public/sabidurIAIcon.svg" alt="Icono Dios de la Sabiduría" />
                </button>
            </div>
        </div>
    );
};
