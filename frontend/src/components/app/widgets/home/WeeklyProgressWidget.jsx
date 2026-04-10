/** React & Third-Party Libraries */
import { useState } from "react";
import { ResponsiveBar } from "@nivo/bar";

const data = [
    { day: "L", minutes: 100 },
    { day: "M", minutes: 160 },
    { day: "X", minutes: 90 },
    { day: "J", minutes: 143 },
    { day: "V", minutes: 110 },
    { day: "S", minutes: 60 },
    { day: "D", minutes: 40 },
];

/**
 * Time Tracker Widget
 *
 * This component renders a widget for tracking time spent on specific tasks.
 * It displays the current task name, associated project, logged time,
 * and controls (play/stop) to manage the timer.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} [props.className] - Additional CSS classes applied to the rootc  element for custom styling.
 * @returns {JSX.Element} The rendered time tracker widget.
 */
export const WeeklyProgressWidget = () => {
    const currentDayIndex = new Date().getDay();
    const daysMap = ["D", "L", "M", "X", "J", "V", "S"];
    const todayStr = daysMap[currentDayIndex];

    const [hoveredBar, setHoveredBar] = useState(null);
    const [lastHoveredBar, setLastHoveredBar] = useState(null);

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

    const activeBar = hoveredBar || lastHoveredBar;

    return (
        <div className="h-full w-full flex flex-col items-start gap-2">
            <div className="relative h-full w-full min-h-0">
                <ResponsiveBar
                    data={data}
                    keys={["minutes"]}
                    indexBy="day"
                    margin={{ top: 16, right: 0, bottom: 30, left: 0 }}
                    padding={0.7}
                    colors={({ data }) => (data.day === todayStr ? "#2F6C4B" : "#BDDDC7")}
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
                                    fill: "#454545",
                                },
                            },
                        },
                    }}
                />

                <div
                    className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col items-center z-10 transition-opacity duration-200 ease-out ${
                        hoveredBar ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                    style={{
                        // Usamos activeBar en lugar de hoveredBar para que no vuelva a 0
                        left: activeBar ? activeBar.x + activeBar.width / 2 : 0,
                        top: activeBar ? activeBar.y + 18 - 8 : 0,
                    }}
                >
                    {activeBar && (
                        <div
                            className={`text-xs font-medium px-2 py-1.5 rounded-full shadow-md text-nowrap ${
                                activeBar.data.indexValue === todayStr
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

export default WeeklyProgressWidget;
