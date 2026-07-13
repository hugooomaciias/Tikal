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
 * A hybrid presentational component that provides an interactive sliding drawer for filtering
 * the Solar Chart data. While primarily visual, it manages minimal local state exclusively for
 * UI interactions, such as tracking custom date selections before they are submitted.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string|null} props.activeDrawer - Determines which filter view is currently open ("TIME", "PROJECTS", or null).
 * @param {Function} props.closeDrawer - Function to close the sliding drawer.
 * @param {string} props.timeMode - The currently selected time aggregation mode (e.g., "DAILY", "WEEKLY").
 * @param {Function} props.handleTimeModeChange - Function to update the time aggregation mode.
 * @param {Array<Object>} props.chartData - Array of data objects representing the tracked projects.
 * @param {Function} props.getIconComponent - Helper function to retrieve the React component for a given icon string.
 * @param {Array<string>} props.tempHiddenProjects - Temporary array of project IDs hidden while the drawer is open.
 * @param {Function} props.toggleTempProjectVisibility - Function to toggle a project's temporary hidden status.
 * @param {Function} props.applyProjectFilters - Function to officially apply the temporary filters to the chart.
 * @returns {JSX.Element} The rendered filter drawer component.
 */
export const FilterComponent = ({
    activeDrawer,
    closeDrawer,
    timeMode,
    handleTimeModeChange,
    chartData,
    getIconComponent,
    tempHiddenProjects,
    toggleTempProjectVisibility,
    applyProjectFilters,
}) => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_statistics" namespace.
     */
    const { t } = useTranslation("app_statistics");

    /**
     * Drawer DOM Reference
     *
     * Used to detect click events outside the drawer's bounding box to auto-close it.
     */
    const drawerRef = useRef(null);

    /**
     * Custom Dates State
     *
     * Holds the start and end dates locally when the user is picking a "CUSTOM" time range.
     */
    const [customDates, setCustomDates] = useState({ start: "", end: "" });

    /**
     * Click Outside Listener Effect
     *
     * Attaches a mousedown event listener to the document to close the drawer
     * if the user clicks outside of the referenced `drawerRef` bounds.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                closeDrawer();
            }
        };

        if (activeDrawer) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDrawer, closeDrawer]);

    // --- 2. Render ---

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
                {/* Drawer Header: Title & Close Action */}
                <div className="flex items-center justify-between p-4">
                    <h3 className="font-bold text-quaternary-50 text-lg">
                        {activeDrawer === "TIME"
                            ? t("widgets.solar_chart.filters.time.title")
                            : t("widgets.solar_chart.filters.levels.title")}
                    </h3>
                    <button className="text-primary/70 hover:text-primary transition-colors" onClick={closeDrawer}>
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Dynamic Content Body */}
                <div
                    className={`flex-1 p-4 ${
                        activeDrawer === "PROJECTS" ? "overflow-y-auto custom-scrollbar" : "overflow-visible"
                    }`}
                >
                    {/* Time Filters View Section */}
                    {activeDrawer === "TIME" && (
                        <div className="flex flex-col gap-2">
                            {/* Standard Time Modes Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "DAILY", label: t("widgets.solar_chart.filters.time.daily") },
                                    { id: "WEEKLY", label: t("widgets.solar_chart.filters.time.weekly") },
                                    { id: "MONTHLY", label: t("widgets.solar_chart.filters.time.monthly") },
                                    { id: "GLOBAL", label: t("widgets.solar_chart.filters.time.global") },
                                ].map((timeObj) => (
                                    <button
                                        key={timeObj.id}
                                        onClick={() => handleTimeModeChange(timeObj.id)}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-colors ${timeMode === timeObj.id ? "bg-primary-600 border-primary-100 text-primary" : "bg-primary border-primary hover:bg-primary-50 hover:border-primary-50 text-quaternary-700"}`}
                                    >
                                        {timeObj.label}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Date Range Selector Block */}
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

                                {/* Custom Date Pickers Inputs */}
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

                    {/* Projects Filter View Section */}
                    {activeDrawer === "PROJECTS" && (
                        <div className="flex flex-col h-full">
                            {/* Projects Selection Grid */}
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

                            {/* Apply Project Filters Action Button */}
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
