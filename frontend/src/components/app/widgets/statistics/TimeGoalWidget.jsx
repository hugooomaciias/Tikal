import { ResponsivePie } from "@nivo/pie";
import tailwindConfig from "../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

export const TimeGoalWidget = ({ props }) => {
    const currentMinutes = props?.currentMinutes || 0;
    const goalMinutes = props?.goalMinutes || 0;
    const completionPercentage = props?.completionPercentage || 0;

    const currentH = Math.floor(currentMinutes / 60);
    const currentM = currentMinutes % 60;
    const goalH = Math.floor(goalMinutes / 60);

    // 3. Limitamos el porcentaje a un máximo del 100% para no romper el gráfico
    // (Por si el usuario trabaja más de las horas objetivo)
    const safePercentage = Math.min(Math.max(completionPercentage, 0), 100);

    const percentageData = [
        { id: "progress", value: safePercentage, color: colors.primary[500] },
        { id: "remaining", value: 100 - safePercentage, color: colors.primary[100] },
    ];

    return (
        <div className="h-full w-full flex flex-col items-center justify-center relative select-none">
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

            {/* Capa de Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-1 text-quaternary-700 mb-2">
                <span className="text-4xl font-bold leading-none">
                    {currentH}h {currentM}m
                </span>
                <span className="text-xl font-medium">de {goalH}h</span>
            </div>
        </div>
    );
};
