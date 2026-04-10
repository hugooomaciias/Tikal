/** Assets & Icons */
import { IconClockHour3Filled, IconBoltFilled, IconTimelineEventFilled, IconBadgesFilled } from "@tabler/icons-react";

/**
 * Icon Mapping
 *
 * A static dictionary linking string keys to their corresponding
 * Tabler Icon components. Declared outside the component to prevent
 * object recreation during standard component re-renders.
 */
const ICON_MAP = {
    ClockHour3Filled: IconClockHour3Filled,
    BoltFilled: IconBoltFilled,
    TimelineEventFilled: IconTimelineEventFilled,
    BadgesFilled: IconBadgesFilled,
};

/**
 * Main Data Header Component
 *
 * A specialized summary header that renders key statistical metrics
 * for the user, such as project progress or current streaks, in a visually
 * prominent card array.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.t - The i18n translation function.
 * @returns {JSX.Element} The rendered main data header.
 */
export const MainDataHeaderComponent = ({ t }) => {
    /**
     * Project Information Options
     *
     * Configuration array for rendering the user's project statistics,
     * including completed, in process, and pending projects.
     */
    const infoOptions = [
        { icon: "ClockHour3Filled", value: "140h 32m", title: t("header.first_stat") },
        { icon: "BoltFilled", value: "87%", title: t("header.second_stat") },
        { icon: "TimelineEventFilled", value: "72%", title: t("header.third_stat") },
        { icon: "BadgesFilled", value: "2", title: t("header.fourth_stat"), iconClass: "rotate-180" },
    ];

    return (
        <header className="h-fit w-full bg-primary shadow-md rounded-[2.5rem] flex items-start py-6 px-8">
            <div className="h-fit w-full flex flex-col md:flex-row items-start md:items-center justify-center gap-5 md:gap-10">
                {/* Data Layout */}
                <div className="w-full flex items-center justify-between">
                    {infoOptions.map((option, index) => {
                        const IconComponent = ICON_MAP[option.icon];

                        return (
                            <div key={index} className="flex items-center gap-4 text-quaternary-700">
                                {/* Left-Aligned Icon Compartment */}
                                <div className="bg-primary-300 p-3 rounded-2xl shadow-sm flex-shrink-0">
                                    <IconComponent
                                        className={`h-6 w-6 md:h-8 md:w-8 text-primary ${option.iconClass}`}
                                    />
                                </div>

                                {/* Right-Aligned Text Information */}
                                <div className="flex flex-col">
                                    {/* Top Title */}
                                    <span className="text-sm md:text-base font-medium text-quaternary-500">
                                        {option.title}
                                    </span>

                                    {/* Bottom Value */}
                                    <span className="text-2xl md:text-3xl font-extrabold leading-none">
                                        {option.value}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};
