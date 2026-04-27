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
} from "@tabler/icons-react";

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
 * @param {Array<Object>} props.data - An array of statistical data objects to display (contains title, value, logo, custom).
 * @returns {JSX.Element|null} The rendered main data header, or null if data is invalid.
 */
export const MainDataHeaderComponent = ({ data }) => {
    // --- 2. Local State ---

    /**
     * Visibility Toggle State
     *
     * Tracks the current collapse/expand state of the specialized summary header on mobile devices.
     */
    const [isVisible, setIsVisible] = useState(true);

    // --- 5. Event Handlers & Functions ---

    /**
     * Toggle Visibility Handler
     *
     * Toggles the mobile visibility state of the summary header when the button is clicked.
     *
     * @returns {void}
     */
    const handleToggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    // --- 6. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="relative w-full">
            {/* Mobile Visibility Control Button */}
            <button
                onClick={handleToggleVisibility}
                className={`absolute md:hidden z-20 flex items-center justify-center p-1.5 rounded-full text-primary-500 transition-all duration-300
                    ${isVisible ? "top-1 left-4 bg-primary-100 shadow-lg -translate-y-1/3 -translate-x-1/2" : "top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"}
                `}
            >
                {/* Visibility Button Content */}
                {isVisible ? (
                    <IconEyeOff className="w-5 h-5" />
                ) : (
                    <div className="w-full flex items-center justify-center gap-2">
                        <IconEye className="w-5 h-5" />
                        <span className="text-sm font-semibold">Mostrar estadísticas</span>
                    </div>
                )}
            </button>

            {/* Main Header Container */}
            <header
                className={`relative w-full bg-primary shadow-md rounded-[2.5rem] transition-all duration-500 ease-in-out overflow-hidden
                ${isVisible ? "h-fit py-6 px-6 md:px-8" : "h-12 py-0 px-8 flex items-center justify-center opacity-90 hover:opacity-100"}
            `}
            >
                {/* Data Layout Wrapper */}
                <div
                    className={`w-full grid grid-cols-2 md:flex md:flex-row items-center justify-between gap-x-2 gap-y-6 md:gap-10 transition-all duration-300
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}
            `}
                >
                    {/* Dynamic Options List */}
                    {data.map((option, index) => {
                        /**
                         * Icon Component
                         *
                         * Dynamically resolves the specific Tabler Icon component from the ICON_MAP based on the option's logo string.
                         */
                        const IconComponent = ICON_MAP[option.logo];

                        return (
                            <div key={index} className="flex items-center gap-3 md:gap-4 text-quaternary-700 min-w-0">
                                {/* Left-Aligned Icon Compartment */}
                                <div className="bg-primary-300 p-2.5 rounded-2xl shadow-sm flex-shrink-0">
                                    <IconComponent className={`h-5 w-5 md:h-8 md:w-8 text-primary ${option.custom}`} />
                                </div>

                                {/* Right-Aligned Text Information */}
                                <div className="flex flex-col">
                                    {/* Option Title */}
                                    <span className="text-sm md:text-base font-medium text-quaternary-500">
                                        {index === 0 ? (
                                            <>
                                                Horas <span className="hidden md:inline"> registradas</span>
                                            </>
                                        ) : (
                                            option.title
                                        )}
                                    </span>

                                    {/* Option Value */}
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
