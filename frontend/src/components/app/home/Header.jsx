/** Assets & Icons */
import {
    IconCircleCheckFilled,
    IconTrendingUp,
    IconClipboardTextFilled,
    IconEditFilled,
    IconSquareRoundedXFilled,
    IconSquareRoundedPlus,
    IconSquareRoundedCheckFilled,
} from "@tabler/icons-react";

/**
 * Icon Component Map
 *
 * A static dictionary linking string keys to their corresponding React icon components.
 * Declared outside the component to prevent unnecessary object recreation during re-renders.
 */
const ICON_MAP = {
    CircleCheckIcon: IconCircleCheckFilled,
    TrendingUpIcon: IconTrendingUp,
    ClipboardIcon: IconClipboardTextFilled,
};

/**
 * Header Component
 *
 * This component renders the top header of the home dashboard. It displays the user's
 * avatar, summary statistics about their projects (completed, in process, pending),
 * and action buttons to toggle edit mode or save/cancel changes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.isEditing - State indicating if the dashboard is in edit mode.
 * @param {Function} props.setIsEditing - Function to update the edit mode state.
 * @param {boolean} props.checkChanges - State indicating if there are unsaved changes.
 * @param {Function} props.setCheckChanges - Function to update the check changes state.
 * @returns {JSX.Element} The rendered header component.
 */
export const Header = ({ isEditing, setIsEditing, checkChanges, setCheckChanges, t }) => {
    /**
     * Project Information Options
     *
     * Configuration array for rendering the user's project statistics,
     * including completed, in process, and pending projects.
     */
    const infoOptions = [
        { icon: "CircleCheckIcon", value: "28", title: t("header.first_stat") },
        { icon: "TrendingUpIcon", value: "5", title: t("header.second_stat") },
        { icon: "ClipboardIcon", value: "10", title: t("header.third_stat") },
        { icon: "ClipboardIcon", value: "10", title: t("header.third_stat") },
    ];

    return (
        <header className="h-fit w-full bg-primary shadow-md rounded-[2.5rem] flex items-start justify-between py-6 px-8">
            {/* User Info & Statistics Section */}
            <div className="h-fit w-fit flex flex-col md:flex-row items-start md:items-start justify-center gap-5 md:gap-14">
                {/* User Avatar */}
                <div className="relative h-24 w-24 md:h-36 md:w-36 flex items-center justify-center p-2 rounded-full overflow-hidden border-[3px] border-primary-600">
                    <div className="h-full w-full bg-primary-600/40 rounded-full overflow-hidden cursor-pointer">
                        <img
                            className="w-full h-full object-cover shadow-md"
                            src="/public/Avatar_0.svg"
                            alt="User Avatar"
                        />
                    </div>
                </div>

                {/* User Data Layout */}
                <div className="grid grid-cols-2 gap-7 md:gap-x-10 md:gap-y-7">
                    {infoOptions.map((option, index) => {
                        const IconComponent = ICON_MAP[option.icon];

                        return (
                            <div key={index} className="flex items-center gap-4 text-quaternary-700">
                                {/* Left-Aligned Icon Compartment */}
                                <div className="bg-primary-300 p-3 rounded-2xl shadow-sm flex-shrink-0">
                                    <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-primary" />
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

            {/* Header Actions Section */}
            <div className="flex gap-4 items-center">
                {/* AI / Assistant Icon and Edit Controls */}
                <div className="w-fit h-fit flex flex-col items-center justify-between gap-2">
                    <img
                        className="w-14 h-14 cursor-pointer hover:scale-105 transition-transform duration-200"
                        src="/public/sabidurIAIcon.svg"
                        alt="God of Wisdom Icon"
                    />

                    {/* Expandable Edit Control Block */}
                    <div
                        className={`hidden md:relative md:flex flex-col items-center justify-center transition-all duration-300 ease-in-out text-primary-600/70 overflow-hidden
                        ${isEditing ? "h-[76px]" : "h-9"} w-9
                    `}
                    >
                        {/* Entry Edit Button (Visible when NOT editing) */}
                        <div
                            className={`absolute flex items-center justify-center w-full h-full cursor-pointer hover:text-primary-600 transition-all duration-300
                                ${!isEditing ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}
                            `}
                            onClick={() => {
                                setIsEditing(true);
                                setCheckChanges(false);
                            }}
                        >
                            <IconEditFilled className="w-full h-full" />
                        </div>

                        {/* Action Bar (Visible when Editing) */}
                        <div
                            className={`absolute flex flex-col items-center justify-between h-full w-full transition-all duration-300
                                ${isEditing ? "opacity-100 scale-100" : "opacity-0 pointer-events-none"}
                            `}
                        >
                            {/* Top Toggle: Cancel / Commit */}
                            <div
                                className="w-full h-1/2 cursor-pointer hover:text-primary-600 transition-all"
                                onClick={() => setIsEditing(false)}
                            >
                                {!checkChanges ? (
                                    <IconSquareRoundedXFilled className="w-full h-full" />
                                ) : (
                                    <IconSquareRoundedCheckFilled className="w-full h-full" />
                                )}
                            </div>

                            {/* Bottom Toggle: Addition Tool */}
                            <div className="w-full h-1/2 cursor-pointer hover:text-primary-600 transition-all mt-1">
                                <IconSquareRoundedPlus className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
