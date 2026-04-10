import { ResponsivePie } from "@nivo/pie";
import tailwindConfig from "../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

export const TimeGoalWidget = ({ percentage = 60, goalMinutes = 50 }) => {
    const data = [
        { id: "progress", value: percentage, color: colors.primary[500] },
        { id: "remaining", value: 100 - percentage, color: colors.primary[100] },
    ];

    return (
        <div className="h-full w-full flex flex-col items-center justify-center relative select-none">
            <div className="w-full h-full">
                <ResponsivePie
                    data={data}
                    startAngle={-90}
                    endAngle={90}
                    innerRadius={0.94}
                    padAngle={1}
                    cornerRadius={45}
                    colors={{ datum: "data.color" }}
                    enableArcLinkLabels={false}
                    enableArcLabels={false}
                    isInteractive={false}
                    s
                    animate={true}
                    motionConfig="gentle"
                    centerY={0.7}
                />
            </div>

            {/* Capa de Texto Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-1 text-quaternary-700 mb-2">
                <span className="text-4xl font-bold leading-none">30h 28m</span>
                <span className="text-xl font-medium">de {goalMinutes}h</span>
            </div>
        </div>
    );
};
