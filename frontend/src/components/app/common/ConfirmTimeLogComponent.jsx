/** Contexts, Hooks & Services */
import { useTranslation } from "react-i18next";

/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";

/**
 * Confirm Time Log Component
 *
 * A modal component that prompts the user to confirm stopping a time log.
 * It displays the task details and allows the user to add an activity description
 * before confirming the action.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.showStopModal - Controls the visibility of the modal.
 * @param {string} props.activityDescription - The current value of the activity description.
 * @param {Function} props.setActivityDescription - State updater function for the activity description.
 * @param {Function} props.cancelStopTimer - Handler function to cancel stopping the timer.
 * @param {Function} props.confirmStopTimer - Handler function to confirm stopping the timer.
 * @param {string} props.taskName - The name of the task being logged.
 * @param {number} props.colorId - The ID representing the color of the project/phase.
 * @param {React.ElementType} props.projectIcon - The icon component for the project.
 * @returns {JSX.Element} The rendered confirm time log modal component.
 */
export const ConfirmTimeLogComponent = ({
    showStopModal,
    activityDescription,
    setActivityDescription,
    cancelStopTimer,
    confirmStopTimer,
    taskName,
    colorId,
    projectIcon: ProjectIcon,
}) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_tasks"
     * namespace for localized text content within the modal.
     */
    const { t } = useTranslation("app_tasks");

    // --- 3. Derived Variables ---

    /**
     * Phase Color Configuration
     *
     * Resolves the corresponding color configuration object based on the provided
     * `colorId`. Defaults to the first defined color if no match is found.
     */
    const color = PHASE_COLOURS.find((c) => c.id === colorId) || PHASE_COLOURS[0];

    // --- 5. Event Handlers & Functions ---

    /**
     * Stop Propagation Handler
     *
     * Prevents click events from bubbling up to the backdrop, avoiding accidental closures
     * when the user interacts with the modal content.
     *
     * @param {React.MouseEvent} e - The mouse click event.
     * @returns {void}
     */
    const handleStopPropagation = (e) => {
        e.stopPropagation();
    };

    // --- 6. Render ---
    return (
        <>
            {showStopModal && (
                /* Modal Overlay Container */
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={cancelStopTimer}
                >
                    {/* Modal Content Container */}
                    <div
                        className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                        onClick={handleStopPropagation}
                    >
                        <div className="flex flex-col gap-2">
                            {/* Header: Dynamic Title and Close Action */}
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

                            <span className="text-quaternary-500">{t("confirm_time_log.description")}</span>

                            {/* Task Summary Banner */}
                            <div
                                className="flex items-center justify-between py-3 px-4 mt-2 rounded-xl text-primary"
                                style={{ backgroundColor: color.hex }}
                            >
                                <ProjectIcon />
                                <span className="font-bold">{taskName}</span>
                            </div>
                        </div>

                        {/* Activity Description Input */}
                        <div className="relative w-full">
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

                            <label htmlFor="note" className="textarea-label input-textarea-label-primary">
                                {t("confirm_time_log.placeholder")}
                            </label>

                            <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                                <IconNote className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Confirmation Action Button */}
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
