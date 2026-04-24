import { useState } from "react";

/** Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";

import { IconTarget, IconCoin } from "@tabler/icons-react";

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
export const TabsComponent = ({ widget, props = [], value, onChange, t }) => {
    /**
     * Tab Type Identifiers
     *
     * Computes the underlying data string representation for the left (first)
     * and right (second) tabs based on the contextual `page` prop.
     */
    const firstTabType =
        widget === "Calendar"
            ? "event"
            : widget === "Task"
              ? "day"
              : widget === "EffectivenessX"
                ? "weekly"
                : widget === "EffectivenessY"
                  ? "concentration"
                  : "this_week";
    const secondTabType =
        widget === "Calendar"
            ? "project"
            : widget === "Task"
              ? "project"
              : widget === "EffectivenessX"
                ? "monthly"
                : widget === "EffectivenessY"
                  ? "profitability"
                  : "this_month";

    /**
     * Current Selection State
     *
     * Retrieves the currently active tab value directly from the parent's form data
     * to determine which side the animated slider should highlight.
     */
    const [internalValue, setInternalValue] = useState(firstTabType);
    const currentValue = value !== undefined ? value : internalValue;

    const handleTabClick = (tabValue) => {
        if (value === undefined) {
            setInternalValue(tabValue); // Usamos el estado interno si no hay prop
        }

        if (onChange) {
            onChange(tabValue); // Le avisamos al padre (el gráfico) del cambio
        }
    };

    const renderFirstTabContent = () => {
        if (widget === "Calendar") return t("widgets.calendar.tabs.event");
        if (widget === "Task") return t("widgets.tasks.tabs.day");
        if (widget === "EffectivenessX") return t("widgets.effectiveness_chart.tabs.axisX.weekly");
        if (widget === "Comparison") return props.week;
        return (
            <div className="flex items-center gap-1.5 justify-center">
                <IconTarget className="h-4 w-4" stroke={2.5} />
                <span>{t("widgets.effectiveness_chart.tabs.axisY.concentration")}</span>
            </div>
        );
    };

    const renderSecondTabContent = () => {
        if (widget === "Calendar") return t("widgets.calendar.tabs.project");
        if (widget === "Task") return t("widgets.tasks.tabs.project");
        if (widget === "EffectivenessX") return t("widgets.effectiveness_chart.tabs.axisX.monthly");
        if (widget === "Comparison") return props.month;
        return (
            <div className="flex items-center gap-1.5 justify-center">
                <IconCoin className="h-4 w-4" stroke={2.5} />
                <span>{t("widgets.effectiveness_chart.tabs.axisY.profitability")}</span>
            </div>
        );
    };

    return (
        <div className="inline-grid grid-cols-2 items-center justify-center bg-primary-100 rounded-full relative overflow-hidden px-1">
            {/* Animated Background Indicator */}
            <div
                className={`absolute top-1 bottom-1 w-[calc(50%-6px)] bg-primary rounded-full shadow-sm transition-all duration-300 ease-out z-0 ${currentValue === firstTabType ? "left-1.5" : "left-[calc(50%+1.5px)]"}`}
            ></div>

            {/* Left / First Tab Button */}
            <button
                type="button"
                onClick={() => handleTabClick(firstTabType)}
                className="relative z-10 flex-1 py-1.5 px-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
            >
                {renderFirstTabContent()}
            </button>

            {/* Right / Second Tab Button */}
            <button
                type="button"
                onClick={() => handleTabClick(secondTabType)}
                className="relative z-10 flex-1 py-1.5 px-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
            >
                {renderSecondTabContent()}
            </button>
        </div>
    );
};
