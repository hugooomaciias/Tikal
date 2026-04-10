import { ResponsiveLine } from "@nivo/line";
import { useEffect } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import tailwindConfig from "../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

// Mantenemos tu objeto original como base
const rawData = {
    selectedMetric: "CONCENTRATION",
    selectedTimeRange: "WEEKLY",
    dataPoints: [
        { label: "Lun", percentage: 80.0 },
        { label: "Mar", percentage: 50.0 },
        { label: "Mie", percentage: 60.0 },
        { label: "Jue", percentage: 65.0 },
        { label: "Vie", percentage: 52.0 },
        { label: "Sab", percentage: 45.0 },
        { label: "Dom", percentage: 35.0 },
    ],
};

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

export const EffectivenessChartWidget = ({ setCustomActions }) => {
    const nivoData = [
        {
            id: "efectividad",
            data: rawData.dataPoints.map((pt) => ({
                x: pt.label,
                y: pt.percentage,
            })),
        },
    ];

    useEffect(() => {
        const actions = (
            <div className="flex gap-2 ml-auto mr-4">
                <div className="flex bg-primary-200/50 p-1 rounded-full border border-primary-100">
                    <button
                        className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${rawData?.selectedMetric === "CONCENTRATION" ? "bg-primary-500 text-white shadow-sm" : "text-primary-400"}`}
                    >
                        % Conc
                    </button>
                    <button
                        className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${rawData?.selectedMetric === "WEEKLY" ? "bg-primary-500 text-white shadow-sm" : "text-primary-400"}`}
                    >
                        % Rent
                    </button>
                </div>
            </div>
        );

        if (setCustomActions) setCustomActions(actions);
        return () => setCustomActions?.(null);
    }, [setCustomActions]);

    return (
        <div className="h-full w-full min-h-0">
            <ResponsiveLine
                data={nivoData}
                margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
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
                        <div className="flex items-center gap-2 bg-primary-300 py-2 px-3 shadow-lg rounded-xl border border-primary-100">
                            <div className="h-full flex items-center gap-2 bg-primary p-2 rounded-lg">
                                <span className="text-[12px] text-primary-300 font-extrabold uppercase tracking-wider">
                                    {point.data.x}
                                </span>
                            </div>

                            <div className="h-full flex flex-col items-start justify-between">
                                <span className="text-xs text-primary">Concentración</span>
                                <span className="text-base font-bold text-primary">{point.data.y}%</span>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
};
