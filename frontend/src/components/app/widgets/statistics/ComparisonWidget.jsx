/** React & Third-Party Libraries */
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Components & Layouts */
import { TabsComponent } from "../common/TabsComponent";

/** Icons */
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";

/**
 * Comparison Widget Component
 *
 * This component displays a list of statistical metrics with visual indicators
 * (trending up, down, or neutral) to compare current performance against previous periods.
 * It also injects a custom tabs navigation component into its parent's header.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the comparison metrics.
 * @param {Array<{label: string, displayValue: string, direction: string}>} [props.props.metrics] - Array of metrics to display.
 * @param {Function} [props.setCustomActions] - Function passed from the parent layout to inject custom header actions.
 * @returns {JSX.Element|null} The rendered comparison widget, or null if no metrics exist.
 */
export const ComparisonWidget = ({ props, setCustomActions }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize widget text content dynamically.
     */
    const { t } = useTranslation("app_statistics");

    // --- 3. Derived Variables ---

    /**
     * Metrics Array
     *
     * Safely extracts the array of metric objects from props, defaulting to an empty array.
     */
    const metrics = props?.metrics || [];

    // --- 4. Side Effects ---

    /**
     * Inject Header Actions Effect
     *
     * Instantiates the custom TabsComponent for navigating comparison modes and
     * injects it into the parent's header via `setCustomActions`. Cleans up on unmount.
     */
    useEffect(() => {
        const actions = <TabsComponent widget="Comparison" props={props} t={t} />;

        if (setCustomActions) {
            setCustomActions(actions);
        }

        return () => setCustomActions?.(null);
    }, [setCustomActions, props, t]);

    // --- 5. Event Handlers & Functions ---

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

    // --- 6. Render ---

    if (!metrics.length) {
        return null;
    }

    return (
        <div className="h-full flex flex-col items-start justify-between w-full">
            {/* Dynamic Metrics List */}
            {metrics.map((metric, index) => {
                const { bg, Icon } = getMetricStyles(metric.direction);

                return (
                    <div key={index} className="flex items-center gap-4 text-quaternary-700">
                        {/* Status Icon Compartment */}
                        <div className={`${bg} p-3 md:p-2.5 rounded-2xl shadow-sm flex-shrink-0`}>
                            <Icon className={`h-5 w-5 md:h-7 md:w-7 text-primary`} />
                        </div>

                        {/* Metric Text Information */}
                        <div className="flex flex-col">
                            {/* Metric Label */}
                            <span className="text-base font-medium text-quaternary-500 leading-none">
                                {metric.label}
                            </span>

                            {/* Metric Value */}
                            <span className="text-xl font-bold leading-none">{metric.displayValue}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
