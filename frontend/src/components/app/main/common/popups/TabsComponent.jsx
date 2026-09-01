/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../../constants/phase_colours.js";

/**
 * Reusable Tabs Component
 *
 * This component is primarily visual, rendering a segmented control/tab switcher used in popups
 * to toggle between two distinct modes. It manages minimal local logic (deriving active types and mapping
 * selection payloads) exclusively for UI interactions, bypassing the need for a dedicated headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.page - The context or page where the tabs are used ("Project", "Stage", "Tasks", or default).
 * @param {Object} props.formData - The current form data state from the parent.
 * @param {Function} props.setFormData - Function to update the parent's form data state.
 * @param {Function} props.setSelected - Function to update the currently selected icon/color in the parent.
 * @param {string} props.fieldToUpdate - The key in `formData` that the tabs govern.
 * @param {string|null} [props.disabledType] - The string value of the tab type that should be disabled and locked.
 * @param {Function} props.t - The i18n translation function.
 * @returns {JSX.Element} The rendered tabs component.
 */
export const TabsComponent = ({ page, formData, onChangeType, onChangeSelected, fieldToUpdate, disabledType = null, t }) => {
    // --- 1. Local UI Logic ---

    const normalizedPage = page?.toLowerCase() || "";

    /**
     * Tab Type Identifiers
     *
     * Computes the underlying data string representation for the left (first)
     * and right (second) tabs based on the contextual `page` prop.
     */
    const firstTabType =
        normalizedPage === "project" ? "project" : normalizedPage === "stage" ? "stage" : normalizedPage === "tasks" ? "details" : normalizedPage === "event" ? "linked" : "create";
    const secondTabType =
        normalizedPage === "project" ? "list" : normalizedPage === "stage" ? "sublist" : normalizedPage === "tasks" ? "subtasks" : normalizedPage === "event" ? "unlinked" : "join";

    /**
     * Current Selection State
     *
     * Retrieves the currently active tab value directly from the parent's form data
     * to determine which side the animated slider should highlight.
     */
    const currentValue = formData[fieldToUpdate];

    /**
     * Type Change Handler
     *
     * Updates the form data type and sets a default icon or colour
     * corresponding to the newly selected type payload.
     *
     * @param {string} newType - The newly selected type string.
     */
    const handleTypeChange = (newType) => {
        if (newType === disabledType) return;
        onChangeType(newType);

        let newDefault;
        let defaultId;

        if (normalizedPage === "project") {
            defaultId = newType === "project" ? "presentation" : "checklist";
            newDefault = PROJECTS_ICONS.find((icon) => icon.id === defaultId);
        } else if (normalizedPage === "stage") {
            defaultId = newType === "stage" ? "pri-100" : "sec-100";
            newDefault = PHASE_COLOURS.find((colour) => colour.id === defaultId);
        } else if (normalizedPage === "tasks") {
            defaultId = newType === "details" ? "pri-100" : "sec-100";
            newDefault = PHASE_COLOURS.find((colour) => colour.id === defaultId);
        } else if (normalizedPage === "event") {
            defaultId = newType === "linked" ? "pri-100" : "sec-100";
            newDefault = PHASE_COLOURS.find((colour) => colour.id === defaultId);
        } else {
            defaultId = newType === "create" ? "pri-100" : "sec-100";
            newDefault = PHASE_COLOURS.find((colour) => colour.id === defaultId);
        }

        if (newDefault && typeof onChangeSelected === "function") {
            onChangeSelected(newDefault);
        }
    };

    // --- 2. Render ---

    return (
        <div className="flex items-center justify-center w-full bg-primary-100 p-1.5 rounded-2xl relative overflow-hidden">
            {/* Animated Background Indicator */}
            <div
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${currentValue === firstTabType ? "left-1.5" : "left-[calc(50%+1.5px)]"}`}
            ></div>

            {/* Left / First Tab Button */}
            <button
                type="button"
                disabled={firstTabType === disabledType}
                onClick={() => handleTypeChange(firstTabType)}
                className={`relative z-10 flex-1 py-2 text-primary-500 text-sm font-semibold transition-all duration-300 ${
                    firstTabType === disabledType
                        ? "opacity-80 cursor-not-allowed"
                        : "cursor-pointer"
                }`}
            >
                {normalizedPage === "project"
                    ? t("projects.popup.tabs.project")
                    : normalizedPage === "stage"
                      ? t("stages.popup.tabs.stage")
                      : normalizedPage === "tasks"
                        ? t("tasks.popup.tabs.details")
                        : normalizedPage === "event"
                          ? t("popup.tabs.linked")
                          : t("teams.popup.tabs.create")
                }
            </button>

            {/* Right / Second Tab Button */}
            <button
                type="button"
                disabled={secondTabType === disabledType}
                onClick={() => handleTypeChange(secondTabType)}
                className={`relative z-10 flex-1 py-2 text-primary-500 text-sm font-semibold transition-all duration-300 ${
                    secondTabType === disabledType
                        ? "opacity-80 cursor-not-allowed"
                        : "cursor-pointer"
                }`}
            >
                {normalizedPage === "project"
                    ? t("projects.popup.tabs.list")
                    : normalizedPage === "stage"
                      ? t("stages.popup.tabs.sublist")
                      : normalizedPage === "tasks"
                        ? t("tasks.popup.tabs.subtasks")
                        : normalizedPage === "event"
                          ? t("popup.tabs.unlinked")
                          : t("teams.popup.tabs.join")
                }
            </button>
        </div>
    );
};
