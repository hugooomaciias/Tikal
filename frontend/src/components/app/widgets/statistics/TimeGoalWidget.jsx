/** React & Third-Party Libraries */
import React, { useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";

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
const colors = fullConfig.theme.colors;

/**
 * Time Goal Widget Component
 *
 * This component displays a semi-circular progress gauge (using Nivo Pie)
 * representing the user's progress towards their daily or weekly time tracking goal.
 * It calculates and formats the current time spent versus the target time.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the goal metrics.
 * @param {number} [props.props.currentMinutes] - The total number of minutes tracked so far.
 * @param {number} [props.props.goalMinutes] - The target goal in minutes.
 * @param {number} [props.props.completionPercentage] - The percentage of the goal completed (0-100).
 * @returns {JSX.Element} The rendered time goal gauge widget.
 */
export const TimeGoalWidget = ({ props }) => {
    // --- 3. Derived Variables ---

    /**
     * Current Minutes
     *
     * Extracts the current accumulated minutes from props, defaulting to 0.
     */
    const currentMinutes = props?.currentMinutes || 0;

    /**
     * Goal Minutes
     *
     * Extracts the target goal in minutes from props, defaulting to 0.
     */
    const goalMinutes = props?.goalMinutes || 0;

    /**
     * Raw Completion Percentage
     *
     * Extracts the completion percentage from props, defaulting to 0.
     */
    const completionPercentage = props?.completionPercentage || 0;

    /**
     * Current Hours (Formatted)
     *
     * Computes the whole number of hours spent for UI display.
     */
    const currentH = Math.floor(currentMinutes / 60);

    /**
     * Current Remaining Minutes (Formatted)
     *
     * Computes the remainder of minutes after full hours are extracted.
     */
    const currentM = currentMinutes % 60;

    /**
     * Goal Hours (Formatted)
     *
     * Computes the whole number of hours in the goal for UI display.
     */
    const goalH = Math.floor(goalMinutes / 60);

    /**
     * Safe Percentage
     *
     * Clamps the completion percentage between 0 and 100 to prevent the Nivo Pie chart
     * from breaking visually if the user exceeds their time goal.
     */
    const safePercentage = Math.min(Math.max(completionPercentage, 0), 100);

    /**
     * Percentage Data
     *
     * Formats the safely clamped percentage into the dataset array required by the
     * Nivo ResponsivePie component, assigning the appropriate primary colors.
     * Wrapped in useMemo to avoid recreating the array on every render.
     */
    const percentageData = useMemo(() => {
        return [
            { id: "progress", value: safePercentage, color: colors.primary[500] },
            { id: "remaining", value: 100 - safePercentage, color: colors.primary[100] },
        ];
    }, [safePercentage]);

    // --- 6. Render ---

    return (
        <div className="h-full w-full flex flex-col items-center justify-center relative select-none">
            {/* Background Chart Container */}
            <div className="w-full h-full">
                <ResponsivePie
                    data={percentageData}
                    startAngle={-90}
                    endAngle={90}
                    innerRadius={0.94}
                    padAngle={1}
                    cornerRadius={45}
                    colors={{ datum: "data.color" }}
                    enableArcLinkLabels={false}
                    enableArcLabels={false}
                    isInteractive={false}
                    animate={true}
                    motionConfig="gentle"
                    centerY={0.7}
                />
            </div>

            {/* Central Overlay Text Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-1 text-quaternary-700 mb-2">
                <span className="text-4xl font-bold leading-none">
                    {currentH}h {currentM}m
                </span>
                <span className="text-xl font-medium">de {goalH}h</span>
            </div>
        </div>
    );
};
