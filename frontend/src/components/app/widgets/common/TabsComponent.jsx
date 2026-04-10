import { useState } from "react";

/** Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

/**
 * Reusable Tabs Component
 *
 * A segmented control/tab switcher used in popups to toggle between two distinct modes.
 * It visually animates between the two states and updates the parent form data accordingly.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.page - The context or page where the tabs are used ("Project", "Stage", "Tasks", or default).
 * @param {Object} props.formData - The current form data state from the parent.
 * @param {Function} props.setFormData - Function to update the parent's form data state.
 * @param {Function} props.setSelected - Function to update the currently selected icon/color in the parent.
 * @param {string} props.fieldToUpdate - The key in `formData` that the tabs govern.
 * @param {Function} props.t - The i18n translation function.
 * @returns {JSX.Element} The rendered tabs component.
 */
export const TabsComponent = ({ widget }) => {
    /**
     * Tab Type Identifiers
     *
     * Computes the underlying data string representation for the left (first)
     * and right (second) tabs based on the contextual `page` prop.
     */
    const firstTabType = widget === "Calendar" ? "event" : "day";
    const secondTabType = widget === "Calendar" ? "project" : "project";

    /**
     * Current Selection State
     *
     * Retrieves the currently active tab value directly from the parent's form data
     * to determine which side the animated slider should highlight.
     */
    const [currentValue, setCurrentValue] = useState(firstTabType);

    return (
        <div className="flex items-center justify-center bg-primary-100 p-1.5 rounded-full relative overflow-hidden">
            {/* Animated Background Indicator */}
            <div
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-full shadow-sm transition-all duration-300 ease-out z-0 ${currentValue === firstTabType ? "left-1.5" : "left-[calc(50%+1.5px)]"}`}
            ></div>

            {/* Left / First Tab Button */}
            <button
                type="button"
                onClick={() => setCurrentValue(firstTabType)}
                className="relative z-10 flex-1 p-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
            >
                {widget === "Calendar" ? "Evento" : "Día"}
            </button>

            {/* Right / Second Tab Button */}
            <button
                type="button"
                onClick={() => setCurrentValue(secondTabType)}
                className="relative z-10 flex-1 p-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
            >
                {widget === "Calendar" ? "Proyecto" : "Proyecto"}
            </button>
        </div>
    );
};
