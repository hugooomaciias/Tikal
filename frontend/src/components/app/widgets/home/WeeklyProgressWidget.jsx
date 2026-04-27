/** React & Third-Party Libraries */
import React, { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";

/** Assets, Utils & Constants */
import tailwindConfig from "../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Weekly Progress Widget Component
 *
 * This component renders a bar chart representing the user's logged time
 * over the past week. It provides an interactive tooltip showing hours and minutes
 * dedicated per day.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the weekly statistics.
 * @param {Array<{dayLabel: string, minutesDedicated: number}>} [props.props.days] - Array of objects representing the days and their logged minutes.
 * @returns {JSX.Element|null} The rendered weekly progress widget chart.
 */
export const WeeklyProgressWidget = ({ props }) => {
    // --- 2. Local State ---

    /**
     * Hovered Bar State
     *
     * Tracks the specific bar element currently being hovered to display the tooltip.
     */
    const [hoveredBar, setHoveredBar] = useState(null);

    /**
     * Last Hovered Bar State
     *
     * Remembers the last hovered bar so the tooltip doesn't abruptly teleport
     * to the origin when the mouse leaves the chart area.
     */
    const [lastHoveredBar, setLastHoveredBar] = useState(null);

    // --- 3. Derived Variables ---

    /**
     * Days Array
     *
     * Safely extracts the array of day statistics from props.
     */
    const days = props?.days || [];

    /**
     * Chart Data
     *
     * Formats the raw backend day data into a structure required by the Nivo ResponsiveBar.
     */
    const chartData = days.map((d) => ({
        day: d.dayLabel,
        minutes: d.minutesDedicated,
    }));

    /**
     * Last Day Label
     *
     * Extracts the string label of the most recent day to apply unique styling (e.g. highlighting today).
     */
    const lastDayLabel = days.length > 0 ? days[days.length - 1].dayLabel : "";

    /**
     * Active Bar Reference
     *
     * Determines which bar data should be used to position and populate the tooltip.
     * Prefers the currently hovered bar, falling back to the last known hovered bar.
     */
    const activeBar = hoveredBar || lastHoveredBar;

    // --- 5. Event Handlers & Functions ---

    /**
     * Custom Bar Component
     *
     * Overrides the default Nivo bar to inject rounded corners (rx), custom tailwind transition classes,
     * and event handlers for setting the custom tooltip state.
     *
     * @param {Object} props - The props injected by Nivo for rendering the bar.
     * @param {Object} props.bar - The geometry and data object for a specific bar.
     * @returns {JSX.Element} The custom SVG rect element representing the bar.
     */
    const CustomBar = ({ bar }) => {
        return (
            <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={bar.width / 2}
                fill={bar.color}
                className="transition-all duration-300 ease-in-out cursor-pointer hover:opacity-80"
                onMouseEnter={() => {
                    setHoveredBar(bar);
                    setLastHoveredBar(bar);
                }}
                onMouseLeave={() => setHoveredBar(null)}
            />
        );
    };

    // --- 6. Render ---

    if (!days || !Array.isArray(days)) return null;

    return (
        <div className="h-full w-full flex flex-col items-start gap-2">
            {/* Chart Wrapper Container */}
            <div className="relative h-full w-full min-h-0">
                {/* Nivo Responsive Bar Chart */}
                <ResponsiveBar
                    data={chartData}
                    keys={["minutes"]}
                    indexBy="day"
                    margin={{ top: 16, right: 0, bottom: 30, left: 0 }}
                    padding={0.7}
                    colors={({ data }) =>
                        data.day === lastDayLabel ? tailwindColors.primary[500] : tailwindColors.primary[100]
                    }
                    barComponent={CustomBar}
                    tooltip={() => <></>}
                    enableGridY={false}
                    axisLeft={null}
                    axisBottom={{
                        tickSize: 0,
                        tickPadding: 12,
                        tickRotation: 0,
                    }}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fontSize: 16,
                                    fontWeight: 500,
                                    fill: tailwindColors.quaternary[700],
                                },
                            },
                        },
                    }}
                />

                {/* Custom Interactive Tooltip */}
                <div
                    className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col items-center z-10 transition-opacity duration-200 ease-out ${
                        hoveredBar ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                    style={{
                        left: activeBar ? activeBar.x + activeBar.width / 2 : 0,
                        top: activeBar ? activeBar.y + 18 - 8 : 0,
                    }}
                >
                    {activeBar && (
                        <div
                            className={`text-xs font-medium px-2 py-1.5 rounded-full shadow-md text-nowrap ${
                                activeBar.data.indexValue === lastDayLabel
                                    ? "bg-primary-500 text-primary"
                                    : "bg-primary-100 text-primary-600"
                            }`}
                        >
                            {Math.floor(activeBar.data.value / 60)}h {activeBar.data.value % 60}m
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
