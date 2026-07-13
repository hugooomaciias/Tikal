/** React & Third-Party Libraries */
import React, { useEffect, useState, useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";

/** Contexts, Hooks & Services */
import { useTranslation } from "react-i18next";

/** Components & Layouts */
import { TabsComponent } from "../../common/widgets/TabsComponent";

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

const EMPTY_DATA_POINTS = [];

/**
 * Effectiveness Chart Widget Component
 *
 * A hybrid presentational component that renders an interactive line chart tracking the user's
 * effectiveness over a given time range. While primarily visual, it manages minimal local state
 * exclusively for UI interactions, specifically tracking the currently selected tabs (metric and time range)
 * to update the chart view dynamically.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the initial configuration and dataset.
 * @param {string} [props.props.selectedMetric] - The initially selected metric (e.g., "concentration").
 * @param {string} [props.props.selectedTimeRange] - The initially selected time range (e.g., "weekly").
 * @param {Array<{label: string, percentage: number}>} [props.props.dataPoints] - The array of data points to plot on the chart.
 * @param {Function} [props.setCustomActions] - Function passed from the parent layout to inject custom header actions (TabsComponent).
 * @returns {JSX.Element|null} The rendered effectiveness chart widget, or null if no data is available.
 */
export const EffectivenessChartWidget = ({ props, setCustomActions }) => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize widget text content dynamically.
     */
    const { t } = useTranslation("app_statistics");

    /**
     * Metric State
     *
     * Tracks the currently selected Y-axis metric for the chart (e.g., "concentration").
     * Defaults to the initial prop value or "concentration".
     */
    const [metric, setMetric] = useState(props?.selectedMetric?.toLowerCase() || "concentration");

    /**
     * Time Range State
     *
     * Tracks the currently selected X-axis time granularity (e.g., "weekly", "monthly").
     * Defaults to the initial prop value or "weekly".
     */
    const [timeRange, setTimeRange] = useState(props?.selectedTimeRange?.toLowerCase() || "weekly");

    /**
     * Data Points
     *
     * Safely extracts the array of chart data points from props, defaulting to an empty array.
     */
    const dataPoints = props?.dataPoints || EMPTY_DATA_POINTS;

    /**
     * Nivo Chart Data
     *
     * Formats the raw data points into the specific nested structure required by
     * the Nivo ResponsiveLine component. Computed using useMemo to prevent unnecessary
     * array mapping during re-renders.
     */
    const nivoData = useMemo(() => {
        return [
            {
                id: "efectividad",
                data: dataPoints.map((pt) => ({
                    x: pt.label,
                    y: pt.percentage,
                })),
            },
        ];
    }, [dataPoints]);

    /**
     * Tooltip Label
     *
     * Determines the human-readable string to display inside the chart tooltip
     * based on the currently selected metric.
     */
    const tooltipLabel =
        metric === "concentration"
            ? t("widgets.effectiveness_chart.tooltip.concentration")
            : t("widgets.effectiveness_chart.tooltip.profitability");

    /**
     * Inject Header Actions Effect
     *
     * Instantiates the custom TabsComponents for navigating the chart's X and Y axes
     * and injects them into the parent's header via `setCustomActions`.
     * Cleans up the injected actions on component unmount.
     */
    useEffect(() => {
        const actions = (
            <div className="flex flex-col items-center justify-end gap-1.5 text-sm text-quaternary-700 font-bold">
                <div className="flex items-center gap-2">
                    <span className="text-nowrap">{t("widgets.effectiveness_chart.axis.x")}</span>
                    <TabsComponent
                        widget="EffectivenessX"
                        value={timeRange}
                        onChange={(newValue) => setTimeRange(newValue)}
                        t={t}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-nowrap">{t("widgets.effectiveness_chart.axis.y")}</span>
                    <TabsComponent
                        widget="EffectivenessY"
                        value={metric}
                        onChange={(newValue) => setMetric(newValue)}
                        t={t}
                    />
                </div>
            </div>
        );

        if (setCustomActions) {
            setCustomActions(actions);
        }

        return () => setCustomActions?.(null);
    }, [setCustomActions, metric, timeRange, t]);

    // --- 2. Render ---

    if (!dataPoints.length) return null;

    return (
        <div className="h-full w-full min-h-0">
            {/* Interactive Nivo Responsive Line Chart Component */}
            <ResponsiveLine
                data={nivoData}
                margin={{ top: 10, right: 30, bottom: 40, left: 50 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: 100 }}
                curve="linear"
                axisTop={null}
                axisRight={null}
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 10,
                    tickValues: [0, 20, 40, 60, 80, 100],
                    format: (v) => `${v}%`,
                }}
                axisBottom={{
                    tickSize: 0,
                    tickPadding: 10,
                }}
                enableGridX={false}
                enableGridY={false}
                colors={colors.primary[100]}
                lineWidth={2.5}
                enablePoints={true}
                pointSize={9}
                pointColor={colors.primary[300]}
                enableArea={true}
                areaOpacity={0.25}
                useMesh={true}
                theme={{
                    axis: {
                        domain: {
                            line: { stroke: colors.quaternary[700], strokeWidth: 1.5 },
                        },
                        ticks: {
                            text: {
                                fill: colors.quaternary[700],
                                fontSize: 13,
                                fontWeight: 700,
                            },
                        },
                    },
                }}
                tooltip={({ point }) => {
                    return (
                        <div className="flex items-center gap-2 bg-primary-300 py-2 px-3 shadow-lg rounded-xl">
                            {/* X-Axis Value Pill */}
                            <div className="h-full flex items-center bg-primary p-2 rounded-lg">
                                <span className="text-[12px] text-primary-300 font-extrabold uppercase tracking-wider">
                                    {point.data.x}
                                </span>
                            </div>

                            {/* Y-Axis Metric Data */}
                            <div className="h-full flex flex-col items-start justify-between">
                                <span className="text-xs text-primary">{tooltipLabel}</span>
                                <span className="text-base font-bold text-primary">{point.data.y}%</span>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
};
