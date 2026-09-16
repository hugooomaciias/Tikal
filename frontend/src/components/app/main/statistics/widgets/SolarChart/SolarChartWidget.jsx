/** React & Third-Party Libraries */
import { ResponsivePie } from "@nivo/pie";

/** Contexts, Hooks & Services */
import { useSolarChartWidgetLogic } from "../../../../../../hooks/components/app/main/statistics/widgets/useSolarChartWidgetLogic.js";

/** Components & Layouts */
import { FilterComponent } from "./FilterComponent.jsx";

/** Icons */
import { IconCalendar, IconFilter, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/** Assets, Utils & Constants */
// (No constants or assets required in this component)

/**
 * Solar Chart Widget Component
 *
 * A purely presentational component that renders an interactive pie chart representing the
 * distribution of time dedicated to different projects or tasks. It delegates all business logic,
 * state management, and interaction handling to its dedicated `useSolarChartWidgetLogic` headless hook,
 * leaving this file entirely focused on the visual layout and structure.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the slices and statistics.
 * @param {Array<{sliceId: number|string, sliceName: string, minutesDedicated: number, logoOrColor: string}>} [props.props.slices] - Array of data slices for the pie chart.
 * @param {string} [props.props.mostRecurringListName] - The name of the most frequently tracked list or project.
 * @returns {JSX.Element|null} The rendered solar chart widget, or null if no data is available.
 */
export const SolarChartWidget = ({ props }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Extracts all required UI states, derived chart data, layout configurations,
     * and specific action handlers managed by the dedicated logic hook.
     */
    const { t, solarChartWidgetStates, solarChartWidgetData, solarChartWidgetActions } = useSolarChartWidgetLogic({
        props,
    });

    const { activeDrawer, tempHiddenProjects, timeMode, timeOffset } = solarChartWidgetStates;
    const { slices, mostRecurringName, chartData, visibleChartData, recurringBgColor, RecurringIcon } =
        solarChartWidgetData;
    const {
        getIconComponent,
        openDrawer,
        getTimeLabel,
        handlePreviousTime,
        handleNextTime,
        closeDrawer,
        handleTimeModeChange,
        toggleTempProjectVisibility,
        applyProjectFilters,
    } = solarChartWidgetActions;

    /**
     * Custom Arc Labels Layer
     *
     * A custom layer for the Nivo Pie chart that overlays cleanly formatted SVG `foreignObject`
     * wrappers precisely positioned at each arc's centroid. This enables using standard Tailwind HTML
     * to render the icons and percentage labels.
     *
     * @param {Object} props - Nivo layer injection props.
     * @param {Array} props.dataWithArc - The array of data enriched with geometric arc paths.
     * @param {Object} props.arcGenerator - The D3 arc generator to compute centroids.
     * @param {number} props.centerX - The absolute X coordinate of the pie chart center.
     * @param {number} props.centerY - The absolute Y coordinate of the pie chart center.
     * @returns {JSX.Element} The SVG group containing the custom arc labels.
     */
    const CustomArcLabelsLayer = ({ dataWithArc, arcGenerator, centerX, centerY }) => {
        return (
            <g transform={`translate(${centerX}, ${centerY})`}>
                {dataWithArc.map((datum) => {
                    const [x, y] = arcGenerator.centroid(datum.arc);
                    const SliceIcon = getIconComponent(datum.data.iconString);

                    return (
                        <foreignObject
                            key={datum.data.id}
                            x={x - 30}
                            y={y - 30}
                            width={60}
                            height={60}
                            style={{ overflow: "visible", pointerEvents: "none" }}
                        >
                            <div className="w-full h-full flex flex-col items-center justify-center text-primary">
                                <SliceIcon size={22} stroke={1.5} />
                                <span className="text-sm font-bold leading-none mt-0.5">{datum.data.value}%</span>
                            </div>
                        </foreignObject>
                    );
                })}
            </g>
        );
    };

    // --- 2. Render ---

    if (!slices.length) {
        return null;
    }

    return (
        <div className="h-full w-full flex flex-col items-center px-4 relative">
            {/* Top Section: Main Content and Chart */}
            <div className="w-full flex flex-col items-center gap-6 my-auto shrink-0">
                {/* Interactive Nivo Pie Chart Container */}
                <div className="min-h-[200px] md:min-h-[230px] w-full mt-2">
                    <ResponsivePie
                        data={visibleChartData}
                        colors={{ datum: "data.color" }}
                        innerRadius={0.4}
                        padAngle={2}
                        cornerRadius={8}
                        margin={{ right: -10, left: -10 }}
                        activeOuterRadiusOffset={0}
                        fit={true}
                        enableArcLinkLabels={false}
                        enableArcLabels={false}
                        isInteractive={true}
                        sortByValue={true}
                        animate={true}
                        layers={["arcs", CustomArcLabelsLayer, "arcLinkLabels", "legends"]}
                        tooltip={({ datum }) => (
                            <div className="flex items-center gap-2 bg-primary-50 py-2 px-3 shadow-lg rounded-xl">
                                <div className="h-full flex flex-col items-start justify-between">
                                    <span className="text-xs text-quaternary-700 text-nowrap">{datum.data.label}</span>
                                    <span className="text-base font-bold text-quaternary-700">
                                        {datum.data.minutes}
                                    </span>
                                </div>
                            </div>
                        )}
                    />
                </div>

                {/* Most Recurring Project Banner */}
                <div className="flex items-center gap-4 text-quaternary-700">
                    <div
                        className="p-2.5 rounded-2xl shadow-sm flex-shrink-0"
                        style={{ backgroundColor: recurringBgColor }}
                    >
                        <RecurringIcon className={`h-4 w-4 md:h-7 md:w-7 text-primary`} />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm md:text-base font-medium text-quaternary-500 leading-none">
                            {t("widgets.solar_chart.most_recurring")}
                        </span>
                        <span className="text-lg md:text-xl font-bold md:-mt-1 leading-none">{mostRecurringName}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Filter Controls Overlay */}
            <div className="flex justify-center shrink-0 w-full z-10 pointer-events-none mt-4 relative">
                {/* Controls Wrapper */}
                <div className="flex items-end min-w-[260px] pointer-events-auto">
                    {/* Time Filter & Navigation Segment */}
                    <div className="w-1/2 flex flex-col relative">
                        {/* Time Offset Controls (Visible only for Daily/Weekly/Monthly) */}
                        {["DAILY", "WEEKLY", "MONTHLY"].includes(timeMode) && (
                            <div className="bg-primary-200 text-primary rounded-t-[20px] px-2 py-1.5 flex items-center justify-between text-xs font-bold shadow-inner z-0">
                                <button
                                    onClick={handlePreviousTime}
                                    className="text-primary/70 hover:text-primary p-0.5 rounded-full transition-colors"
                                >
                                    <IconChevronLeft size={14} stroke={3} />
                                </button>
                                <span>{getTimeLabel()}</span>
                                <button
                                    onClick={handleNextTime}
                                    className="hover:bg-primary-300 p-0.5 rounded-full transition-colors"
                                    disabled={timeOffset >= 0}
                                >
                                    <IconChevronRight
                                        size={14}
                                        stroke={3}
                                        className={timeOffset >= 0 ? "opacity-30" : ""}
                                    />
                                </button>
                            </div>
                        )}

                        {/* Open Time Filter Modal Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openDrawer("TIME");
                            }}
                            className={`relative z-10 flex items-center justify-center w-full gap-1.5 bg-primary-300 text-primary p-2.5 ${timeMode === "DAILY" || timeMode === "WEEKLY" || timeMode === "MONTHLY" ? "" : "rounded-tl-[32px]"} text-xs font-bold transition-colors hover:bg-primary-400/90`}
                        >
                            <IconCalendar size={20} stroke={2} />
                            <span className="capitalize">
                                {timeMode === "GLOBAL"
                                    ? "Global"
                                    : timeMode === "CUSTOM"
                                      ? "Custom"
                                      : timeMode === "DAILY"
                                        ? "Diario"
                                        : timeMode === "WEEKLY"
                                          ? "Semanal"
                                          : "Mensual"}
                            </span>
                        </button>
                    </div>

                    {/* Projects Filter Toggle Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openDrawer("PROJECTS");
                        }}
                        className="w-1/2 relative z-10 flex items-center justify-center gap-1.5 bg-primary-300 text-primary p-2.5 rounded-tr-[32px] text-xs font-bold transition-colors hover:bg-primary-400/90"
                    >
                        <IconFilter size={20} stroke={2} />
                        <span>Proyectos</span>
                    </button>
                </div>
            </div>

            {/* Hidden Drawer Component Overlay (Filters Panel) */}
            <FilterComponent
                activeDrawer={activeDrawer}
                closeDrawer={closeDrawer}
                timeMode={timeMode}
                handleTimeModeChange={handleTimeModeChange}
                chartData={chartData}
                getIconComponent={getIconComponent}
                tempHiddenProjects={tempHiddenProjects}
                toggleTempProjectVisibility={toggleTempProjectVisibility}
                applyProjectFilters={applyProjectFilters}
            />
        </div>
    );
};
