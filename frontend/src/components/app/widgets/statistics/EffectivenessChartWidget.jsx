import { ResponsiveLine } from "@nivo/line";
import { useEffect, useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import tailwindConfig from "../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/** Components */
import { TabsComponent } from "../common/TabsComponent";

/** Language */
import { useTranslation } from "react-i18next";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

export const EffectivenessChartWidget = ({ props, setCustomActions }) => {
    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * statistics namespace.
     */
    const { t } = useTranslation("app_statistics");

    const [metric, setMetric] = useState(props?.selectedMetric?.toLowerCase() || "concentration");
    const [timeRange, setTimeRange] = useState(props?.selectedTimeRange?.toLowerCase() || "weekly");

    const dataPoints = props?.dataPoints || [];

    const nivoData = [
        {
            id: "efectividad",
            data: dataPoints.map((pt) => ({
                x: pt.label,
                y: pt.percentage,
            })),
        },
    ];

    useEffect(() => {
        const actions = (
            <div className="flex flex-col items-center justify-end gap-1.5 text-sm text-quaternary-700 font-bold">
                <div className="flex items-center gap-2">
                    <span>{t("widgets.effectiveness_chart.axis.x")}</span>
                    <TabsComponent
                        widget="EffectivenessX"
                        value={timeRange}
                        onChange={(newValue) => setTimeRange(newValue)}
                        t={t}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span>{t("widgets.effectiveness_chart.axis.y")}</span>
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

    const tooltipLabel = metric === "concentration" ? "Concentración" : "Rentabilidad";

    if (!dataPoints.length) return null;

    return (
        <div className="h-full w-full min-h-0">
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
                            <div className="h-full flex items-center bg-primary p-2 rounded-lg">
                                <span className="text-[12px] text-primary-300 font-extrabold uppercase tracking-wider">
                                    {point.data.x}
                                </span>
                            </div>

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
