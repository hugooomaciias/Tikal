/** React & Third-Party Libraries */
import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/** Components & Layouts */
import { DatePickerComponent } from "../../../common/popups/DatepickerComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconCheck } from "@tabler/icons-react";

/**
 * Filter Drawer Component
 *
 * This component provides an interactive sliding drawer for filtering the Solar Chart data.
 * It allows the user to filter by specific time ranges (Daily, Weekly, Monthly, Global, or Custom Dates)
 * and toggle the visibility of individual projects tracked in the chart.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string|null} props.activeDrawer - Determines which filter view is currently open ("TIME", "PROJECTS", or null).
 * @param {Function} props.setActiveDrawer - Function to open or close the drawer.
 * @param {string} props.timeMode - The currently selected time aggregation mode (e.g., "DAILY", "WEEKLY").
 * @param {Function} props.setTimeMode - Function to update the time aggregation mode.
 * @param {Function} props.setTimeOffset - Function to reset or modify the time navigation offset.
 * @param {Array<Object>} props.chartData - Array of data objects representing the tracked projects.
 * @param {Function} props.getIconComponent - Helper function to retrieve the React component for a given icon string.
 * @param {Array<string>} props.tempHiddenProjects - Temporary array of project IDs hidden while the drawer is open (before applying).
 * @param {Function} props.setTempHiddenProjects - Function to update the temporary hidden projects state.
 * @param {Function} props.setHiddenProjects - Function to officially apply the hidden projects filter to the chart.
 * @returns {JSX.Element} The rendered filter drawer component.
 */
export const FilterComponent = ({
    activeDrawer,
    setActiveDrawer,
    timeMode,
    setTimeMode,
    setTimeOffset,
    chartData,
    getIconComponent,
    tempHiddenProjects,
    setTempHiddenProjects,
    setHiddenProjects,
}) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize widget text content dynamically.
     */
    const { t } = useTranslation("app_statistics");

    /**
     * Drawer DOM Reference
     *
     * Used to detect clicks outside of the drawer area to automatically close it.
     */
    const drawerRef = useRef(null);

    // --- 2. Local State ---

    /**
     * Custom Dates State
     *
     * Holds the start and end dates selected when the "CUSTOM" time mode is active.
     */
    const [customDates, setCustomDates] = useState({ start: "", end: "" });

    // --- 4. Side Effects ---

    /**
     * Click Outside Listener Effect
     *
     * Attaches a mousedown event listener to the document to close the drawer
     * if the user clicks outside of the referenced `drawerRef` bounds.
     * Only active when `activeDrawer` is truthy.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setActiveDrawer(null);
            }
        };

        if (activeDrawer) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDrawer, setActiveDrawer]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Handle Time Mode Change
     *
     * Updates the chart's time aggregation mode, resets the timeline offset,
     * and automatically closes the drawer if the mode is not custom.
     *
     * @param {string} mode - The selected time mode identifier ("DAILY", "WEEKLY", "CUSTOM", etc.).
     */
    const handleTimeModeChange = (mode) => {
        setTimeMode(mode);
        setTimeOffset(0);
        if (mode !== "CUSTOM") setActiveDrawer(null);
    };

    /**
     * Toggle Temporary Project Visibility
     *
     * Adds or removes a project ID from the temporary hidden state array.
     * This allows users to toggle multiple projects before hitting "Apply".
     *
     * @param {string} id - The unique identifier of the project to toggle.
     */
    const toggleTempProjectVisibility = (id) => {
        setTempHiddenProjects((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

    /**
     * Apply Project Filters
     *
     * Commits the temporary hidden projects state to the active chart state,
     * triggering a re-render of the chart, and then closes the drawer.
     */
    const applyProjectFilters = () => {
        setHiddenProjects([...tempHiddenProjects]);
        setActiveDrawer(null);
    };

    // --- 6. Render ---

    return (
        <div
            className={`absolute inset-0 overflow-hidden z-20 rounded-[inherit] ${
                activeDrawer ? "pointer-events-auto " : "pointer-events-none "
            }${activeDrawer === "TIME" && timeMode === "CUSTOM" ? "overflow-visible" : "overflow-hidden"}`}
        >
            {/* Sliding Drawer Container */}
            <div
                ref={drawerRef}
                className={`absolute w-full inset-0 bg-primary-300 z-20 flex flex-col rounded-3xl transition-transform duration-300 ease-in-out ${
                    activeDrawer ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {/* Header: Title & Close Button */}
                <div className="flex items-center justify-between p-4">
                    <h3 className="font-bold text-quaternary-50 text-lg">
                        {activeDrawer === "TIME"
                            ? t("widgets.solar_chart.filters.time.title")
                            : t("widgets.solar_chart.filters.levels.title")}
                    </h3>
                    <button
                        className="text-primary/70 hover:text-primary transition-colors"
                        onClick={() => setActiveDrawer(null)}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Dynamic Options List */}
                <div
                    className={`flex-1 p-4 ${
                        activeDrawer === "PROJECTS" ? "overflow-y-auto custom-scrollbar" : "overflow-visible"
                    }`}
                >
                    {/* Time Filters View */}
                    {activeDrawer === "TIME" && (
                        <div className="flex flex-col gap-2">
                            {/* Standard Modes Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "DAILY", label: t("widgets.solar_chart.filters.time.daily") },
                                    { id: "WEEKLY", label: t("widgets.solar_chart.filters.time.weekly") },
                                    { id: "MONTHLY", label: t("widgets.solar_chart.filters.time.monthly") },
                                    { id: "GLOBAL", label: t("widgets.solar_chart.filters.time.global") },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTimeModeChange(t.id)}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-colors ${timeMode === t.id ? "bg-primary-600 border-primary-100 text-primary" : "bg-primary border-primary hover:bg-primary-50 hover:border-primary-50 text-quaternary-700"}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Date Range Section */}
                            <div>
                                <button
                                    onClick={() => handleTimeModeChange("CUSTOM")}
                                    className={`w-full p-3 text-sm font-bold transition-colors ${
                                        timeMode === "CUSTOM"
                                            ? "bg-primary-600 border-x-2 border-t-2 border-primary-100 text-primary rounded-t-xl"
                                            : "bg-primary border-2 border-primary hover:bg-primary-50 hover:border-primary-50 text-quaternary-700 rounded-xl"
                                    }`}
                                >
                                    {t("widgets.solar_chart.filters.time.custom.title")}
                                </button>

                                {/* Custom Date Pickers */}
                                {timeMode === "CUSTOM" && (
                                    <div className="flex flex-col gap-2 p-4 bg-primary-600 border-x-2 border-b-2 border-t-none border-primary-100 rounded-b-xl animate-fade-in">
                                        <div className="flex gap-2">
                                            <DatePickerComponent
                                                value={customDates.start}
                                                onChange={(date) =>
                                                    setCustomDates((prev) => ({ ...prev, start: date }))
                                                }
                                                label={t("widgets.solar_chart.filters.time.custom.startDate")}
                                                className="input input-primary peer z-100"
                                            />
                                            <DatePickerComponent
                                                value={customDates.end}
                                                onChange={(date) => setCustomDates((prev) => ({ ...prev, end: date }))}
                                                label={t("widgets.solar_chart.filters.time.custom.endDate")}
                                                className="input input-primary peer"
                                            />
                                        </div>
                                        <div className="mt-auto pt-2 shrink-0">
                                            <button
                                                onClick={applyProjectFilters}
                                                className="w-full py-3 bg-primary text-primary-600 rounded-xl font-bold hover:bg-primary-100 transition-colors shadow-sm"
                                            >
                                                {t("widgets.solar_chart.filters.time.custom.apply")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Projects Filter View */}
                    {activeDrawer === "PROJECTS" && (
                        <div className="flex flex-col h-full">
                            {/* Projects Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {chartData.map((s) => {
                                    const PIcon = getIconComponent(s.iconString);
                                    const isHidden = tempHiddenProjects.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => toggleTempProjectVisibility(s.id)}
                                            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 shadow-sm border-2 ${isHidden ? "border-transparent opacity-60 grayscale bg-gray-100" : "border-primary-100"}`}
                                            style={{ backgroundColor: isHidden ? undefined : s.color }}
                                        >
                                            {!isHidden && (
                                                <div className="absolute top-2 right-2 text-white bg-black/20 rounded-full p-0.5">
                                                    <IconCheck size={14} stroke={3} />
                                                </div>
                                            )}
                                            <PIcon
                                                size={32}
                                                stroke={1.5}
                                                className={isHidden ? "text-gray-400" : "text-white"}
                                            />
                                            <span
                                                className={`mt-2 text-xs font-bold text-center leading-tight ${isHidden ? "text-gray-500" : "text-white"}`}
                                            >
                                                {s.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Apply Filters Button */}
                            <div className="mt-auto pt-2 shrink-0">
                                <button
                                    onClick={applyProjectFilters}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm"
                                >
                                    {t("widgets.solar_chart.filters.levels.apply")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
