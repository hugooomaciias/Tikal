/** React & Third-Party Libraries */
import { useTranslation } from "react-i18next";

/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";
import { PROJECTS_ICONS } from "../../../constants/projects_icons.js";

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
                        className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {/* Modal Header & Task Summary Section */}
                        <div className="flex flex-col gap-2">
                            {/* Modal Title & Close Action */}
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-quaternary-700">
                                    {t("confirm_time_log.title")}
                                </span>

                                <button
                                    className="text-primary-500/70 hover:text-primary-500 transition-colors"
                                    onClick={cancelStopTimer}
                                >
                                    <IconCircleXFilled className="h-8 w-8" />
                                </button>
                            </div>

                            {/* Informational Prompt */}
                            <span className="text-quaternary-500">{t("confirm_time_log.description")}</span>

                            {/* Task Summary Banner */}
                            <div
                                className="flex items-center justify-between py-3 px-4 mt-2 rounded-xl text-primary"
                                style={{ backgroundColor: color.hex }}
                            >
                                <Logo.component />
                                <span className="font-bold">{taskName}</span>
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
                                className="textarea input-textarea-primary peer"
                            ></textarea>

                            {/* Floating Textarea Label */}
                            <label htmlFor="note" className="textarea-label input-textarea-label-primary">
                                {t("confirm_time_log.placeholder")}
                            </label>

                            {/* Decorative Textarea Icon */}
                            <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                                <IconNote className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Confirmation Action Section */}
                        <button
                            type="button"
                            onClick={confirmStopTimer}
                            className="btn btn-primary md:min-w-1/2 mx-auto"
                        >
                            <span>{t("confirm_time_log.button")}</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
