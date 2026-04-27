/** React & Third-Party Libraries */
import React, { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { useTranslation } from "react-i18next";

/** Components & Layouts */
import { FilterComponent } from "./FilterComponent.jsx";

/** Icons */
import { IconCalendar, IconFilter, IconBook, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";
import tailwindConfig from "../../../../../../tailwind.config.js";
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
 * Solar Palette Configuration
 *
 * Exact color palette extracted from the design (dark to light),
 * used to dynamically style the pie slices.
 */
const SOLAR_PALETTE = [
    colors.primary[800], // Verde muy oscuro
    colors.primary[600], // Verde medio
    colors.primary[400], // Verde claro
    colors.primary[200], // Verde muy claro
    colors.primary[50], // Por si hay más de 4 elementos
];

/**
 * Get Icon Component Helper
 *
 * Maps a string identifier to its corresponding React Icon component from the registry.
 *
 * @param {string} iconId - The unique identifier of the icon.
 * @returns {React.ComponentType} The resolved React component or a default fallback.
 */
const getIconComponent = (iconId) => {
    const foundIcon = PROJECTS_ICONS.find((icon) => icon.id === iconId);
    return foundIcon ? foundIcon.component : IconBook;
};

/**
 * Solar Chart Widget Component
 *
 * This component renders an interactive pie chart representing the distribution
 * of time dedicated to different projects or tasks. It features custom arc labels,
 * time and project filtering via a bottom-anchored menu, and dynamic data aggregation.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.props - The data object containing the slices and statistics.
 * @param {Array<{sliceId: number|string, sliceName: string, minutesDedicated: number, logoOrColor: string}>} [props.props.slices] - Array of data slices for the pie chart.
 * @param {string} [props.props.mostRecurringListName] - The name of the most frequently tracked list or project.
 * @returns {JSX.Element|null} The rendered solar chart widget, or null if no data is available.
 */
export const SolarChartWidget = ({ props }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize widget text content dynamically.
     */
    const { t } = useTranslation("app_statistics");

    // --- 2. Local State ---

    /**
     * Active Drawer State
     *
     * Tracks which filter drawer ("TIME" or "PROJECTS") is currently open.
     */
    const [activeDrawer, setActiveDrawer] = useState(null);

    /**
     * Hidden Projects State
     *
     * Array of project IDs that are officially hidden and excluded from the pie chart calculation.
     */
    const [hiddenProjects, setHiddenProjects] = useState([]);

    /**
     * Temporary Hidden Projects State
     *
     * Array of project IDs hidden while interacting with the projects filter drawer,
     * before the user commits the changes.
     */
    const [tempHiddenProjects, setTempHiddenProjects] = useState([]);

    /**
     * Time Mode State
     *
     * Determines the current time aggregation mode for the chart (e.g., "GLOBAL", "DAILY", "WEEKLY").
     */
    const [timeMode, setTimeMode] = useState("GLOBAL");

    /**
     * Time Offset State
     *
     * Tracks the numerical offset (e.g., days or weeks ago) from the current date when
     * navigating through specific time modes.
     */
    const [timeOffset, setTimeOffset] = useState(0);

    // --- 3. Derived Variables ---

    /**
     * Slices Data
     *
     * Safely extracts the array of chart slices from props.
     */
    const slices = props?.slices || [];

    /**
     * Sorted Slices
     *
     * Sorts the data slices in descending order based on the minutes dedicated.
     */
    const sortedSlices = [...slices].sort((a, b) => b.minutesDedicated - a.minutesDedicated);

    /**
     * Most Recurring Name
     *
     * Safely extracts the most recurring list name, providing a fallback string.
     */
    const mostRecurringName = props?.mostRecurringListName || "Desconocido";

    /**
     * Chart Data
     *
     * Maps the sorted backend slices into the structure required by Nivo,
     * injecting icons and colors based on the solar palette.
     */
    const chartData = sortedSlices.map((slice, index) => ({
        id: slice.sliceId.toString(),
        label: slice.sliceName,
        minutes: slice.minutesDedicated,
        iconString: slice.logoOrColor,
        color: SOLAR_PALETTE[index % SOLAR_PALETTE.length],
    }));

    /**
     * Visible Slices Base
     *
     * Filters out the slices that the user has opted to hide via the projects filter.
     */
    const visibleSlicesBase = chartData.filter((d) => !hiddenProjects.includes(d.id));

    /**
     * Total Visible Minutes
     *
     * Computes the total sum of minutes across all currently visible slices
     * to calculate proportional percentages.
     */
    const totalVisibleMinutes = visibleSlicesBase.reduce((sum, slice) => sum + slice.minutes, 0);

    /**
     * Visible Chart Data
     *
     * Enhances the visible slices with their calculated percentage values for display in labels.
     */
    const visibleChartData = visibleSlicesBase.map((slice) => ({
        ...slice,
        value: totalVisibleMinutes > 0 ? Math.round((slice.minutes / totalVisibleMinutes) * 100) : 0,
    }));

    /**
     * Recurring Data
     *
     * Finds the specific slice data matching the most recurring list name to extract its styling.
     */
    const recurringData = chartData.find((d) => d.label === mostRecurringName);

    /**
     * Recurring Background Color
     *
     * Extracts the specific background color for the recurring project, with a fallback.
     */
    const recurringBgColor = recurringData ? recurringData.color : colors.primary[100];

    /**
     * Recurring Icon Component
     *
     * Dynamically retrieves the React Icon component for the most recurring list.
     */
    const RecurringIcon = getIconComponent(recurringData?.iconString);

    // --- 5. Event Handlers & Functions ---

    /**
     * Open Drawer
     *
     * Opens the specified filter drawer. If opening the projects drawer,
     * it clones the current `hiddenProjects` state to the `tempHiddenProjects` state
     * so edits can be made non-destructively.
     *
     * @param {string} drawerType - The type of drawer to open ("TIME" or "PROJECTS").
     */
    const openDrawer = (drawerType) => {
        if (drawerType === "PROJECTS") {
            setTempHiddenProjects([...hiddenProjects]);
        }
        setActiveDrawer(drawerType);
    };

    /**
     * Get Month Name
     *
     * Converts a given Date object into its short, uppercase localized month string (e.g., "ENE").
     *
     * @param {Date} date - The date object to extract the month from.
     * @returns {string} The localized month abbreviation.
     */
    const getMonthName = (date) => {
        const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        return months[date.getMonth()];
    };

    /**
     * Get Time Label
     *
     * Computes the human-readable string representation of the current time range
     * based on the selected `timeMode` and `timeOffset` relative to today.
     *
     * @returns {string} The formatted time label string.
     */
    const getTimeLabel = () => {
        const today = new Date();

        if (timeMode === "DAILY") {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + timeOffset);
            return `${targetDate.getDate()} ${getMonthName(targetDate)}`;
        }

        if (timeMode === "WEEKLY") {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + timeOffset * 7);

            const dayOfWeek = targetDate.getDay() || 7;
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - dayOfWeek + 1);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${getMonthName(startOfWeek)}`;
            } else {
                return `${startOfWeek.getDate()} ${getMonthName(startOfWeek)} - ${endOfWeek.getDate()} ${getMonthName(endOfWeek)}`;
            }
        }

        if (timeMode === "MONTHLY") {
            const targetDate = new Date(today);
            targetDate.setMonth(today.getMonth() + timeOffset);
            return getMonthName(targetDate);
        }

        return "";
    };

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

    // --- 6. Render ---

    if (!slices.length) {
        return null;
    }

    return (
        <div className="h-full w-full flex flex-col items-center justify-between px-4 relative">
            <div className="w-full flex flex-col items-center gap-6">
                {/* Nivo Chart Container */}
                <div className="flex-1 min-h-[230px] w-full mt-2">
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
                                        {datum.data.minutes} min
                                    </span>
                                </div>
                            </div>
                        )}
                    />
                </div>

                {/* Most Recurring List Section */}
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
                        <span className="text-lg md:text-xl font-bold -mt-1 leading-none">{mostRecurringName}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Filter Controls */}
            <div className="flex justify-center shrink-0 w-full z-10 pointer-events-none mt-4 relative">
                <div className="flex items-end min-w-[260px] pointer-events-auto">
                    {/* Time Filter & Navigation Segment */}
                    <div className="w-1/2 flex flex-col relative">
                        {/* Time Offset Controls */}
                        {["DAILY", "WEEKLY", "MONTHLY"].includes(timeMode) && (
                            <div className="bg-primary-200 text-primary rounded-t-[20px] px-2 py-1.5 flex items-center justify-between text-xs font-bold shadow-inner z-0">
                                <button
                                    onClick={() => setTimeOffset((prev) => prev - 1)}
                                    className="text-primary/70 hover:text-primary p-0.5 rounded-full transition-colors"
                                >
                                    <IconChevronLeft size={14} stroke={3} />
                                </button>
                                <span>{getTimeLabel()}</span>
                                <button
                                    onClick={() => setTimeOffset((prev) => prev + 1)}
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

                        {/* Open Time Filter Button */}
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

                    {/* Projects Filter Segment */}
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

            {/* Hidden Drawer Component Overlay */}
            <FilterComponent
                activeDrawer={activeDrawer}
                setActiveDrawer={setActiveDrawer}
                timeMode={timeMode}
                setTimeMode={setTimeMode}
                setTimeOffset={setTimeOffset}
                chartData={chartData}
                getIconComponent={getIconComponent}
                tempHiddenProjects={tempHiddenProjects}
                setTempHiddenProjects={setTempHiddenProjects}
                setHiddenProjects={setHiddenProjects}
            />
        </div>
    );
};
