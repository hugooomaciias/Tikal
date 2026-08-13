/** React & Third-Party Libraries */
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../hooks/core/useSync.js";
import { useTimeLog } from "../../../../hooks/core/useTimeLog.js";

/** Components & Layouts */
import { ScrollingText } from "./ScrollingText.jsx";

/** Icons */
import { IconCircleXFilled, IconNote, IconAlertTriangleFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { RANK_CLASSES } from "../../../../constants/rank_classes.js";

/**
 * Confirm Time Log Component
 *
 * This component is primarily visual, rendering a modal to confirm the stopping of a time log session.
 * It manages minimal local logic exclusively for UI interactions (e.g., pulling localized translations
 * and resolving dynamic design tokens based on task metadata), bypassing the need for a dedicated headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.showStopModal - Controls the visibility of the modal.
 * @param {string} props.activityDescription - The controlled value of the activity description text area.
 * @param {Function} props.setActivityDescription - State updater callback for the activity description.
 * @param {Function} props.cancelStopTimer - Handler callback to close the modal without saving the session.
 * @param {Function} props.confirmStopTimer - Handler callback to confirm and securely log the tracked time.
 * @param {string} props.taskName - The name of the currently active task being logged.
 * @param {number} props.colorId - The configuration ID representing the project/phase color.
 * @param {string|number} props.projectIcon - The string identifier used to resolve the SVG icon component for the active project.
 * @returns {JSX.Element} The rendered confirm time log modal overlay.
 */
export const ConfirmTimeLogComponent = ({
    showStopModal,
    activityDescription,
    setActivityDescription,
    cancelStopTimer,
    confirmStopTimer,
    taskName,
    colorId,
    projectIcon
}) => {
    // --- 1. Local UI Logic ---

    /**
     * Localization Hook
     *
     * Injects the translation function scoped to the common application namespace.
     */
    const { t } = useTranslation("app_common");

    /**
     * Global Synchronization Context
     *
     * Extracts raw dashboard data to silently check if the session being closed is a 
     * Temple Mode session, and retrieves the user's progression data to resolve themes.
     */
    const { getTempleModeData, getHomeWidgetsData } = useSync();

    /**
     * Global Time Tracker Context
     *
     * Extracts the real-time execution state of the tracker to determine if the user 
     * is aborting a focus session before reaching their configured target time.
     */
    const { trackerStates } = useTimeLog();
    const { activeWidgetData, accumulatedSeconds } = trackerStates;

    /**
     * Active Phase Color
     *
     * Resolves the correct hex color representing the active project phase, defaulting to the primary brand color.
     */
    const color = PHASE_COLOURS.find((c) => c.id === colorId) || PHASE_COLOURS[0];

    /**
     * Active Task Icon
     *
     * Resolves the corresponding SVG icon object from the global constants based on the provided identifier, 
     * providing a reliable fallback to a default icon if the lookup fails.
     */
    const Logo = PROJECTS_ICONS.find((i) => i.id === projectIcon) || PROJECTS_ICONS[0];

    /**
     * Dynamic Theme Evaluation
     *
     * Evaluates if the current tracking session operates under Temple Mode 
     * directly from the synchronized widget data flag.
     */
    const isTempleModeActive = getHomeWidgetsData()?.timeTrackerWidget?.isTempleMode === true;

    /**
     * Dynamic Theme Extraction
     *
     * Extracts the user's gamification rank exclusively if Temple Mode is active. 
     * Defaults to '1' if the payload is still hydrating to prevent undefined 
     * dictionary lookups that break CSS variable injection.
     */
    const rank = getTempleModeData()?.rank || 1;

    /**
     * Early Stop Detection Logic
     *
     * Calculates if the user is attempting to halt a Temple Mode session before fulfilling 
     * the requested duration. This triggers a visual penalty warning to discourage breaking focus.
     */
    const targetTimeSeconds = (activeWidgetData?.targetTime || 25) * 60;
    const isStoppedEarly = isTempleModeActive && (accumulatedSeconds < targetTimeSeconds);

    /**
     * Dynamic Theme Styles Configuration
     *
     * Consolidates all conditional CSS classes into a single dictionary.
     * If `rank` exists (Temple Mode), it applies the gamified immersive styling.
     * Otherwise, it gracefully falls back to the standard application design system.
     */
    const styles = {
        bg: isTempleModeActive ? "bg-rank-900" : "bg-primary-50",
        title: isTempleModeActive ? "text-rank-50" : "text-quaternary-700",
        closeBtn: isTempleModeActive ? "text-rank-100 opacity-70 hover:text-rank-100 hover:opacity-100" : "text-primary-500/70 hover:text-primary-500",
        description: isTempleModeActive ? "text-rank-100 opacity-70" : "text-quaternary-500",
        task: isTempleModeActive ? "bg-rank-400" : "",
        input: isTempleModeActive ? "bg-rank text-quaternary-700 focus:ring-rank-500 peer" : "input-textarea-primary peer",
        label: isTempleModeActive ? "text-rank-800 peer-focus:text-rank-400 peer-[:not(:placeholder-shown)]:text-rank-400" : "input-textarea-label-primary",
        btn: isTempleModeActive ? "bg-gradient-to-r from-rank-300 to-rank-600 text-rank" : "btn-primary",
    };

    // --- 2. Render ---

    return (
        <>
            {/* Modal Overlay Container */}
            {showStopModal && (
                <div
                    className={`${RANK_CLASSES[rank]} fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm`}
                    onClick={cancelStopTimer}
                >
                    {/* Modal Content Container */}
                    <div
                        className={`relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 ${styles.bg} rounded-[2.5rem] p-8 animate-fade-in-up`}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {/* Modal Header & Task Summary Section */}
                        <div className="flex flex-col gap-2">
                            {/* Modal Title & Close Action */}
                            <div className="flex items-center justify-between">
                                <span className={`text-2xl font-bold ${isTempleModeActive && "font-passero tracking-wide"} ${styles.title}`}>
                                    {t("confirm_time_log.title")}
                                </span>

                                <button
                                    className={`${styles.closeBtn} transition-colors`}
                                    onClick={cancelStopTimer}
                                >
                                    <IconCircleXFilled className="h-8 w-8" />
                                </button>
                            </div>

                            {/* Informational Prompt */}
                            <span className={styles.description}>{t("confirm_time_log.description")}</span>

                            {/* Early Stop Warning Banner */}
                            {isStoppedEarly && (
                                <div className="flex items-center gap-2 bg-tertiary-500/60 border border-tertiary-500 p-3 rounded-xl mt-2 text-tertiary">
                                    <IconAlertTriangleFilled className="w-8 h-8  shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium leading-tight">
                                        {t("confirm_time_log.warning")}
                                    </p>
                                </div>
                            )}

                            {/* Task Summary Banner */}
                            <div
                                className={`flex items-center justify-between gap-3 py-3 px-4 mt-2 rounded-xl text-primary ${isTempleModeActive ? styles.task : ""}`}
                                style={{ backgroundColor: !isTempleModeActive ? color.hex : "" }}
                            >
                                {isTempleModeActive ? (
                                    <div className="flex items-center gap-2">
                                        <Logo.component />

                                        <div
                                            className="w-[1.35rem] h-[1.35rem] rounded-full shrink-0 border-2"
                                            style={{ backgroundColor: color.hex }}
                                        ></div>
                                    </div>
                                ) : (
                                    <Logo.component />
                                )}
                                <ScrollingText className="font-bold text-end" text={taskName} />
                            </div>
                        </div>

                        {/* Activity Description Form Section */}
                        <div className="relative w-full">
                            {/* Controlled Textarea Component */}
                            <textarea
                                id="note"
                                name="note"
                                rows="4"
                                placeholder=" "
                                value={activityDescription}
                                onChange={(e) => setActivityDescription(e.target.value)}
                                required
                                className={`textarea ${styles.input}`}
                            ></textarea>

                            {/* Floating Textarea Label */}
                            <label htmlFor="note" className={`textarea-label ${styles.label} cursor-pointer truncate max-w-[90%]`}>
                                {t("confirm_time_log.placeholder")}
                            </label>

                            {/* Decorative Textarea Icon */}
                            <div className={`input-icon ${styles.label} items-start pt-3`}>
                                <IconNote className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Confirmation Action Section */}
                        <button
                            type="button"
                            onClick={confirmStopTimer}
                            className={`btn ${styles.btn} md:min-w-1/2 mx-auto`}
                        >
                            <span>{t("confirm_time_log.button")}</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
