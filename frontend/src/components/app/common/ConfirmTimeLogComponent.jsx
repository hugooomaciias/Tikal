/** React & Third-Party Libraries */
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { useSync } from "../../../hooks/core/useSync.js";

/** Components & Layouts */
import { ScrollingText } from "./ScrollingText.jsx";

/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../constants/projects_icons.js";
import { RANK_THEMES } from "../../../constants/rank_themes.js";

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
 * @param {string} props.projectIcon - The SVG icon component for the active project.
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
     * Evaluates if the current tracking session operates under Temple Mode. If true, 
     * it fetches the user's rank and maps it to the corresponding global UI theme payload.
     * Returns null if it's a standard focus session, preserving default styling.
     */
    const isTempleModeActive = getHomeWidgetsData()?.timeTrackerWidget?.isTempleMode === true;

    let theme = null;
    if (isTempleModeActive) {
        const rank = getTempleModeData()?.rank || 0;
        theme = RANK_THEMES[rank] || RANK_THEMES[0];
    }

    /**
     * Dynamic Theme Styles Configuration
     *
     * Consolidates all conditional CSS classes into a single dictionary.
     * If `theme` exists (Temple Mode), it applies the gamified immersive styling.
     * Otherwise, it gracefully falls back to the standard application design system.
     */
    const styles = {
        bg: theme ? theme?.background : "bg-primary-50",
        title: theme ? theme?.title : "text-quaternary-700",
        closeBtn: theme ? `${theme?.subtitle} ${theme?.subtitleHover}` : "text-primary-500/70 hover:text-primary-500",
        description: theme ? theme?.subtitle : "text-quaternary-500",
        task: theme ? theme?.progress : "",
        input: theme ? theme?.input?.focus : "input-textarea-primary peer",
        label: theme ? `${theme?.input?.placeholder} ${theme?.input?.labelFocus}` : "input-textarea-label-primary",
        btn: theme ? `${theme?.buttonSecondary}` : "btn-primary",
    };

    // --- 2. Render ---

    return (
        <>
            {/* Modal Overlay Container */}
            {showStopModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
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
                                <span className={`text-2xl font-bold ${theme && "font-passero tracking-wide"} ${styles.title}`}>
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

                            {/* Task Summary Banner */}
                            <div
                                className={`flex items-center justify-between gap-3 py-3 px-4 mt-2 rounded-xl text-primary ${theme ? styles.task : ""}`}
                                style={{ backgroundColor: !theme ? color.hex : "" }}
                            >
                                {theme ? (
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
