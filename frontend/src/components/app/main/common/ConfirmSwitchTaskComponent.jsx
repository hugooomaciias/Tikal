/** React & Third-Party Libraries */
import { useTranslation } from "react-i18next";
import resolveConfig from "tailwindcss/resolveConfig";

/** Components & Layouts */
import { ScrollingText } from "./ScrollingText.jsx";

/** Contexts, Hooks & Services */
import { useSync } from "../../../../hooks/core/useSync.js";

/** Icons */
import { IconCircleXFilled, IconNote, IconPyramid } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";
import { RANK_THEMES } from "../../../../constants/rank_themes.js";
import tailwindConfig from "../../../../../tailwind.config.js";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Confirm Switch Task Component
 *
 * This component is primarily visual, rendering a modal to confirm the switching of active tasks.
 * It manages minimal local logic exclusively for UI interactions (e.g., resolving dynamic icons and colors
 * from the design system based on task metadata), avoiding the overhead of a dedicated headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.pendingSwitchTask - The target task data object the user wants to switch to.
 * @param {string} props.taskName - The name of the currently active task.
 * @param {Function} props.projectIcon - The React icon component of the currently active task.
 * @param {string} props.activeColorId - The color ID associated with the currently active task.
 * @param {Function} props.cancelSwitchTask - Callback to close the modal without saving and cancel the switch.
 * @param {Function} props.confirmSwitchTask - Callback to execute the task switch and submit the activity description.
 * @param {string} props.activityDescription - Controlled state value for the activity description textarea.
 * @param {Function} props.setActivityDescription - Callback to update the activity description controlled state.
 * @returns {JSX.Element} The rendered confirmation modal.
 */
export const ConfirmSwitchTaskComponent = ({
    pendingSwitchTask,
    taskName,
    projectIcon,
    activeColorId,
    cancelSwitchTask,
    confirmSwitchTask,
    activityDescription,
    setActivityDescription,
}) => {
    // --- 1. Local UI Logic ---

    /**
     * Localization Hook
     *
     * Injects the translation function scoped to the common application namespace.
     */
    const { t } = useTranslation("app_common");

    /**
     * Active Task Icon Component
     *
     * Resolves the icon for the currently active task, defaulting to a fallback icon if none is provided.
     */
    const OldIcon = PROJECTS_ICONS.find((i) => i.id === projectIcon) || PROJECTS_ICONS[0];

    /**
     * Active Task Color
     *
     * Resolves the hex color for the currently active task, defaulting to the primary brand color.
     */
    const oldColor = PHASE_COLOURS.find((c) => c.id === activeColorId)?.hex || tailwindColors.primary[500];

    /**
     * Target Task Icon Component
     *
     * Resolves the icon for the pending target task, defaulting to a fallback icon if none is provided.
     */
    const NewIcon = PROJECTS_ICONS.find((i) => i.id === pendingSwitchTask?.logo) || PROJECTS_ICONS[0];

    /**
     * Target Task Color
     *
     * Resolves the hex color for the pending target task, defaulting to the primary brand color.
     */
    const newColor = PHASE_COLOURS.find((c) => c.id === pendingSwitchTask?.colour)?.hex || tailwindColors.primary[500];

    /**
     * Temple Mode Interception Flag
     *
     * A boolean flag evaluating whether the pending switch task is a synthetic interceptor
     * generated when the user attempts to enter the "Temple Mode" route with an active timer.
     * This triggers a specific UI variation.
     */
    const isTempleModeIntercept = pendingSwitchTask?.taskId === "temple_mode_intercept";

    /**
     * Dynamic Theme Extraction
     *
     * If the component is rendering in the context of a Temple Mode interception,
     * it accesses the global synchronization context to retrieve the user's current rank.
     * This rank dictates the specific visual theme (colors, borders) applied to the modal.
     */
    let theme;
    if (isTempleModeIntercept) {
        const { getTempleModeData } = useSync();
        theme = RANK_THEMES[getTempleModeData().rank] || RANK_THEMES[0];
    }

    // --- 2. Render ---
    
    if (!pendingSwitchTask) return null;
    
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={cancelSwitchTask}
        >
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {/* Modal Header & Context Section */}
                <div className="flex flex-col gap-2">
                    {/* Modal Title Banner */}
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-quaternary-700">{t("confirm_switch_time_log.title")}</span>

                        <button
                            className="text-primary-500/70 hover:text-primary-500 transition-colors"
                            onClick={cancelSwitchTask}
                        >
                            <IconCircleXFilled className="h-8 w-8" />
                        </button>
                    </div>

                    {/* Contextual Information Text */}
                    <span className="text-quaternary-500">
                        {isTempleModeIntercept
                            ? t("confirm_switch_time_log.description.temple")
                            : t("confirm_switch_time_log.description.tasks")
                        }
                    </span>

                    {/* Task Comparison Section */}
                    <div className="flex flex-col items-center justify-between gap-2 mt-3">
                        {/* Current Task Details Box */}
                        <div className="w-full flex flex-col items-start rounded-xl text-quaternary-700">
                            <span className="text-sm font-bold">{t("confirm_switch_time_log.current_task")}</span>

                            <div
                                className="w-full flex items-center justify-between gap-3 py-3 px-4 rounded-xl text-primary"
                                style={{ backgroundColor: oldColor }}
                            >
                                <OldIcon.component className="w-5 h-5" />
                                <ScrollingText className="font-bold text-end" text={taskName} />
                            </div>
                        </div>

                        {/* Target Task Details Box */}
                        <div className="w-full flex flex-col items-start rounded-xl text-quaternary-700">
                            <span className="text-sm font-bold">
                                {isTempleModeIntercept
                                    ? t("confirm_switch_time_log.new_task.temple.title")
                                    : t("confirm_switch_time_log.new_task.tasks")
                                }
                            </span>

                            {/* Target Task Pill */}
                            <div
                                className={`w-full flex items-center justify-between gap-3 py-3 px-4 rounded-xl text-primary ${isTempleModeIntercept ? theme.progress : ""}`}
                                style={{ backgroundColor: !isTempleModeIntercept ? newColor : "" }}
                            >
                                {isTempleModeIntercept ? (
                                    <>
                                        <IconPyramid className="w-5 h-5" />
                                        <span className="font-bold">{t("confirm_switch_time_log.new_task.temple.name")}</span>
                                    </>
                                ) : (
                                    <>
                                        <NewIcon.component className="w-5 h-5" />
                                        <ScrollingText className="font-bold text-end" text={pendingSwitchTask?.name} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Description Form Section */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-quaternary-500">
                        {t("confirm_switch_time_log.note")} <b>{taskName}</b>
                    </span>

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
                            {t("confirm_switch_time_log.placeholder")}
                        </label>

                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Modal Action Buttons Wrapper */}
                <div className="w-full flex items-center gap-3 mt-2">
                    {/* Cancel Action Button */}
                    <button
                        type="button"
                        onClick={cancelSwitchTask}
                        className="w-full btn bg-tertiary-200 text-primary"
                    >
                        <span>{t("confirm_switch_time_log.button.cancel")}</span>
                    </button>

                    {/* Confirm Action Button */}
                    <button type="button" onClick={confirmSwitchTask} className="w-full btn btn-primary">
                        <span>
                            {isTempleModeIntercept
                            ? t("confirm_switch_time_log.button.confirm.temple")
                            : t("confirm_switch_time_log.button.confirm.tasks")}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
