/** React & Third-Party Libraries */
import React, { useState } from "react";

/** Icons */
import {
    IconLayoutKanbanFilled,
    IconTarget,
    IconCoin,
    IconCalendarWeekFilled,
    IconCalendarMonthFilled,
} from "@tabler/icons-react";

/**
 * Reusable Tabs Component
 *
 * A segmented control/tab switcher used in widgets to toggle between two distinct modes or views.
 * It visually animates between the two states and can act either as a controlled or uncontrolled component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.widget - Contextual identifier for the widget ("Task", "Comparison", "Calendar", "EffectivenessX", "EffectivenessY").
 * @param {Object|Array} [props.props=[]] - Extra configuration props, used specifically for "Comparison" widget labels (`week`, `month`).
 * @param {string} [props.value] - The currently selected tab value (if used as a controlled component).
 * @param {Function} [props.onChange] - Callback fired when a tab is clicked.
 * @param {Function} props.t - Internationalization function for translating strings.
 * @returns {JSX.Element}
 */
export const TabsComponent = ({ widget, props = [], value, onChange, t }) => {
    // --- 2. Local State ---

    /**
     * Internal Tab State
     *
     * Tracks the selected tab when the component is used in an uncontrolled manner
     * (i.e., when no `value` prop is provided by the parent). It initializes using the
     * left tab type calculation logic.
     */
    const [internalValue, setInternalValue] = useState(() => {
        return widget === "Calendar"
            ? "event"
            : widget === "Task"
              ? "day"
              : widget === "EffectivenessX"
                ? "weekly"
                : widget === "EffectivenessY"
                  ? "concentration"
                  : "this_week";
    });

    // --- 3. Derived Variables ---

    /**
     * First Tab Identifier
     *
     * Computes the underlying data string representation for the left (first) tab
     * based on the contextual `widget` prop.
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

    /**
     * Second Tab Identifier
     *
     * Computes the underlying data string representation for the right (second) tab
     * based on the contextual `widget` prop.
     */
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
     * Current Active Value
     *
     * Resolves the currently active tab by prioritizing the controlled `value` prop
     * over the `internalValue` state.
     */
    const currentValue = value !== undefined ? value : internalValue;

    // --- 5. Event Handlers & Functions ---

    /**
     * Handle Tab Selection
     *
     * Updates the internal state (if uncontrolled) and triggers the parent `onChange` callback.
     *
     * @param {string} tabValue - The data value associated with the clicked tab.
     */
    const handleTabClick = (tabValue) => {
        if (value === undefined) {
            setInternalValue(tabValue);
        }

        if (onChange) {
            onChange(tabValue);
        }
    };

    /**
     * Render First Tab Content
     *
     * Determines and returns the appropriate label or icon-text combination
     * for the first tab based on the `widget` context.
     *
     * @returns {string|JSX.Element} The visual content of the first tab.
     */
    const renderFirstTabContent = () => {
        if (widget === "Task") return t("widgets.tasks.tabs.day");
        if (widget === "Comparison") return props.week;

        if (widget === "Calendar") {
            return (
                <div className="flex items-center gap-1.5 justify-center">
                    <IconLayoutKanbanFilled className="h-5 w-5 md:hidden -rotate-90" stroke={2.5} />
                    <span className="hidden md:block">{t("widgets.calendar.tabs.event")}</span>
                </div>
            );
        }

        if (widget === "EffectivenessX") {
            return (
                <div className="flex items-center gap-1.5 justify-center">
                    <IconCalendarWeekFilled className="h-5 w-5 md:hidden" stroke={2.5} />
                    <span className="hidden md:block">{t("widgets.effectiveness_chart.tabs.axisX.weekly")}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5 justify-center">
                <IconTarget className="h-5 w-5 md:hidden" stroke={2.5} />
                <span className="hidden md:block">{t("widgets.effectiveness_chart.tabs.axisY.concentration")}</span>
            </div>
        );
    };

    /**
     * Render Second Tab Content
     *
     * Determines and returns the appropriate label or icon-text combination
     * for the second tab based on the `widget` context.
     *
     * @returns {string|JSX.Element} The visual content of the second tab.
     */
    const renderSecondTabContent = () => {
        if (widget === "Task") return t("widgets.tasks.tabs.project");
        if (widget === "Comparison") return props.month;

        if (widget === "Calendar") {
            return (
                <div className="flex items-center gap-1.5 justify-center">
                    <IconLayoutKanbanFilled className="h-5 w-5 md:hidden" stroke={2.5} />
                    <span className="hidden md:block">{t("widgets.calendar.tabs.project")}</span>
                </div>
            );
        }

        if (widget === "EffectivenessX") {
            return (
                <div className="flex items-center gap-1.5 justify-center">
                    <IconCalendarMonthFilled className="h-5 w-5 md:hidden" stroke={2.5} />
                    <span className="hidden md:block">{t("widgets.effectiveness_chart.tabs.axisX.monthly")}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1.5 justify-center">
                <IconCoin className="h-5 w-5 md:hidden" stroke={2.5} />
                <span className="hidden md:block">{t("widgets.effectiveness_chart.tabs.axisY.profitability")}</span>
            </div>
        );
    };

    // --- 6. Render ---

    return (
        <div className="inline-grid grid-cols-2 items-center justify-center bg-primary-100 rounded-full relative overflow-hidden px-1">
            {/* Animated Slider Background */}
            <div
                className={`absolute top-1 bottom-1 w-[calc(50%-6px)] bg-primary rounded-full shadow-sm transition-all duration-300 ease-out z-0 ${currentValue === firstTabType ? "left-1.5" : "left-[calc(50%+1.5px)]"}`}
            ></div>

            {/* Left Tab Button */}
            <button
                type="button"
                onClick={() => handleTabClick(firstTabType)}
                className="relative z-10 flex-1 py-1.5 px-2 text-sm text-primary-500 font-semibold transition-colors duration-300"
            >
                {renderFirstTabContent()}
            </button>

            {/* Right Tab Button */}
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
