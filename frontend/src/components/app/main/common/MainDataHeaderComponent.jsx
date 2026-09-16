/** React & Third-Party Libraries */
import { useState } from "react";

/** Icons */
import {
    IconClockHour3Filled,
    IconBoltFilled,
    IconTimelineEventFilled,
    IconBadgesFilled,
    IconEye,
    IconEyeOff,
    IconCalendarEventFilled,
    IconProgress,
    IconChartLine,
    IconTrophyFilled,
    IconUserFilled,
    IconListFilled,
    IconClipboardTextFilled,
    IconCalendarDue
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
/**
 * Icon Mapping
 *
 * A static dictionary linking string keys to their corresponding
 * Tabler Icon components. Declared outside the component to prevent
 * object recreation during standard component re-renders.
 */
const ICON_MAP = {
    IconClockHour3Filled,
    IconBoltFilled,
    IconTimelineEventFilled,
    IconBadgesFilled,
    IconCalendarEventFilled,
    IconProgress,
    IconChartLine,
    IconTrophyFilled,
    IconUserFilled,
    IconListFilled,
    IconClipboardTextFilled,
    IconCalendarDue
};

/**
 * Main Data Header Component
 *
 * A hybrid presentational component rendering a specialized summary header that displays key
 * statistical metrics for the user in a prominent card array. While primarily visual, it manages
 * minimal local state exclusively for UI interactions (i.e., visibility toggling on mobile devices)
 * to avoid over-engineering with headless hooks.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.data - An array of statistical data objects to display (contains title, value, logo, custom).
 * @returns {JSX.Element|null} The rendered main data header overlay, or null if data is invalid.
 */
export const MainDataHeaderComponent = ({ data, home, team }) => {
    // --- 2. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="relative w-full">
            {/* Prominent Data Header Card */}
            <header className="relative h-fit w-full bg-primary shadow-md rounded-[2.5rem] py-6 px-6 md:px-8 transition-all duration-500 ease-in-out overflow-hidden">
                {/* Statistical Data Grid Layout */}
                <div className="w-full grid grid-cols-2 md:flex md:flex-row items-center justify-between gap-x-2 gap-y-6 md:gap-10 transition-all duration-300">
                    {/* Metrics Iteration Render */}
                    {data.map((option, index) => {
                        /**
                         * Dynamic Icon Resolution
                         *
                         * Retrieves the precise Tabler Icon element mapped to the given string key.
                         */
                        const IconComponent = ICON_MAP[option.logo];
                        const isRank = IconComponent === IconBadgesFilled;

                        return (
                            <div key={index} className="flex items-center gap-3 md:gap-4 text-quaternary-700 min-w-0">
                                {/* Left-Aligned Graphic Compartment */}
                                <div className="bg-primary-300 p-2.5 rounded-2xl shadow-sm flex-shrink-0">
                                    <IconComponent className={`h-5 w-5 md:h-8 md:w-8 text-primary ${isRank ? "rotate-180" : ""}`} />
                                </div>

                                {/* Right-Aligned Typography Column */}
                                <div className="flex flex-col">
                                    {/* Metric Label */}
                                    <span className="text-sm md:text-base font-medium text-quaternary-500">
                                        {index === 0 && !team && !home  ? (
                                            <>
                                                Horas <span className="hidden md:inline"> registradas</span>
                                            </>
                                        ) : (
                                            option.title
                                        )}
                                    </span>

                                    {/* Metric Value */}
                                    <span className="text-2xl md:text-3xl font-extrabold leading-none">
                                        {option.value}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </header>
        </div>
    );
};
