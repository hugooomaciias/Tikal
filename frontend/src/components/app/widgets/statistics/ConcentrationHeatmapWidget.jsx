/** React & Third-Party Libraries */
import React, { useMemo } from "react";

/**
 * Intensity Colors Mapping
 *
 * Maps abstract intensity levels (e.g., "LOW", "HIGH") to concrete Tailwind CSS
 * background and text color utility classes used to paint the heatmap cells.
 */
const INTENSITY_COLORS = {
    NONE: "bg-primary-50 text-primary-200", // x = 0
    VERY_LOW: "bg-primary-100/50 text-primary-500", // 0 < x <=2
    LOW: "bg-primary-100 text-primary-700", // 2 < x <=4
    MEDIUM: "bg-primary-200 text-primary-700", // 4 < x <= 6
    HIGH: "bg-primary-400 text-primary", // 6 < x <= 8
    VERY_HIGH: "bg-primary-500 text-primary", // 8 < x <= 10
    MAXIMUM: "bg-primary-700 text-primary", // 10 < x
};

const EMPTY_DAYS = [];

/**
 * Concentration Heatmap Widget Component
 *
 * This component renders a monthly calendar-style heatmap displaying daily
 * focus concentration levels based on the minutes dedicated. It includes
 * interactive tooltips for exact metrics and dynamic color scaling.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the heatmap parameters.
 * @param {number} [props.props.year] - The year to display (defaults to current year).
 * @param {number} [props.props.month] - The month to display (1-12, defaults to current month).
 * @param {Array<{date: string, dayOfMonth: number, minutesDedicated: number, intensity: string}>} [props.props.days] - The array of daily concentration data.
 * @returns {JSX.Element|null} The rendered concentration heatmap widget, or null if no data is provided.
 */
export const ConcentrationHeatmapWidget = ({ props }) => {
    // --- 3. Derived Variables ---

    /**
     * Year Selection
     *
     * Extracts the target year from props, falling back to the current local year.
     */
    const year = props?.year || new Date().getFullYear();

    /**
     * Month Selection
     *
     * Extracts the target month from props (1-12), falling back to the current local month.
     */
    const month = props?.month || new Date().getMonth() + 1;

    /**
     * Days Array
     *
     * Safely retrieves the array of daily metrics from the props payload.
     */
    const days = props?.days || EMPTY_DAYS;

    /**
     * Heatmap Grid Data
     *
     * Computes the final structured array required to render the 7-column calendar grid.
     * It dynamically pads the beginning of the month with empty placeholder cells based on
     * the actual weekday the month begins on. Computations are wrapped in useMemo to prevent
     * unnecessary recalculations during re-renders.
     */
    const heatmap = useMemo(() => {
        if (!days.length) return [];

        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const emptySlots = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const data = [];

        // Insert empty padding slots for preceding days of the first week
        for (let i = 0; i < emptySlots; i++) {
            data.push({ dayOfMonth: null, intensity: "NONE", minutesDedicated: 0 });
        }

        // Map and insert the actual daily data from the backend
        days.forEach((day) => {
            data.push({
                date: day.date,
                dayOfMonth: day.dayOfMonth,
                minutesDedicated: day.minutesDedicated,
                intensity: INTENSITY_COLORS[day.intensity] ? day.intensity : "NONE",
            });
        });

        return data;
    }, [days, year, month]);

    // --- 6. Render ---

    if (!heatmap.length) {
        return null;
    }

    return (
        <div className="h-full w-full flex items-center justify-center p-1">
            {/* Heatmap 7-Column Grid */}
            <div className="grid grid-cols-7 gap-1 w-full">
                {heatmap.map((day, index) => {
                    if (!day.dayOfMonth) {
                        return <div key={index} className="h-5 md:h-[26px]"></div>;
                    }

                    return (
                        <div
                            key={index}
                            title={day.dayOfMonth ? `${day.minutesDedicated} min` : ""}
                            className={`relative group/celda h-5 md:h-[26px] flex items-center justify-center rounded-md text-[11px] font-bold transition-all duration-300 ${INTENSITY_COLORS[day.intensity]}`}
                        >
                            <span className="leading-none">{day.dayOfMonth}</span>

                            {/* Custom Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 invisible group-hover/celda:opacity-100 group-hover/celda:visible transition-all duration-200 z-50 pointer-events-none">
                                {/* Tooltip Content Box */}
                                <div className="bg-primary-300 text-primary-50 text-[10px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1">
                                    <span className="font-extrabold">{day.minutesDedicated}</span>
                                    <span>min</span>
                                </div>

                                {/* Tooltip Down Arrow Triangle */}
                                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-primary-300 mx-auto"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
