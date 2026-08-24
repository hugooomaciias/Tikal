/** React & Third-Party Libraries */
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Components & Layouts */
import { TabsComponent } from "../../common/widgets/TabsComponent";

/** Icons */
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";

/**
 * Comparison Widget Component
 *
 * A hybrid presentational component that displays statistical metrics with visual trend indicators.
 * While primarily visual, it manages minimal local side effects exclusively to inject
 * custom header tabs navigation into the parent's layout.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the comparison metrics.
 * @param {Array<{label: string, displayValue: string, direction: string}>} [props.props.metrics] - Array of metrics to display.
 * @param {Function} [props.setCustomActions] - Function passed from the parent layout to inject custom header actions.
 * @returns {JSX.Element|null} The rendered comparison widget, or null if no metrics exist.
 */
export const ComparisonWidget = ({ props, setCustomActions }) => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_statistics" namespace.
     */
    const { t } = useTranslation("app_statistics");

    /**
     * Metrics Array
     *
     * Safely extracts the array of metric objects from props, defaulting to an empty array.
     */
    const metrics = useMemo(() => props?.metrics || [], [props?.metrics]);

    /**
     * Get Metric Styles
     *
     * Determines the appropriate background color class and Tabler Icon component
     * based on the trend direction of the metric.
     *
     * @param {string} direction - The trend direction ("POSITIVE", "NEGATIVE", "NEUTRAL").
     * @returns {{bg: string, Icon: React.ComponentType}} An object containing the tailwind background class and the React icon component.
     */
    const getMetricStyles = (direction) => {
        switch (direction) {
            case "POSITIVE":
                return {
                    bg: "bg-primary-300",
                    Icon: IconTrendingUp,
                };
            case "NEGATIVE":
                return {
                    bg: "bg-tertiary-200",
                    Icon: IconTrendingDown,
                };
            case "NEUTRAL":
            default:
                return {
                    bg: "bg-primary-600",
                    Icon: IconMinus,
                };
        }
    };

    // --- 2. Render ---

    if (!metrics.length) {
        return null;
    }

    return (
        <div className="h-full flex flex-col items-start justify-between w-full">
            {/* Dynamic Metrics List Layout */}
            {metrics.map((metric, index) => {
                const { bg, Icon } = getMetricStyles(metric.direction);

                return (
                    <div key={index} className="flex items-center gap-4 text-quaternary-700">
                        {/* Status Icon Compartment */}
                        <div className={`${bg} p-2 rounded-xl shadow-sm flex-shrink-0`}>
                            <Icon className={`h-5 w-5 md:h-7 md:w-7 text-primary`} />
                        </div>

                        {/* Metric Text Information Column */}
                        <div className="flex flex-col">
                            {/* Metric Label */}
                            <span className="text-base font-medium text-quaternary-500 leading-none">
                                {metric.label}
                            </span>

                            {/* Metric Value Display */}
                            <span className="text-xl font-bold leading-none">{metric.displayValue}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
