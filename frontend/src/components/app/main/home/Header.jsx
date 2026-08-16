/** Contexts, Hooks & Services */
import { useHeaderLogic } from "../../../../hooks/components/app/main/home/useHeaderLogic.js";

/** Icons */
import {
    IconListFilled,
    IconClockHour3Filled,
    IconClipboardTextFilled,
    IconCalendarDue,
    IconEditFilled,
    IconSquareRoundedXFilled,
    IconSquareRoundedCheckFilled,
    IconSquareRoundedPlus,
    IconLogout,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoSabidurIA from "../../../../assets/ia/sabidurIAIcon.svg";

/**
 * Icon Component Map
 *
 * A static dictionary linking string keys to their corresponding React icon components.
 * Declared outside the component to prevent unnecessary object recreation during re-renders.
 */
const ICON_MAP = {
    IconListFilled: IconListFilled,
    IconClockHour3Filled: IconClockHour3Filled,
    IconClipboardTextFilled: IconClipboardTextFilled,
    IconCalendarDue: IconCalendarDue
};

/**
 * Header Component
 *
 * This purely visual component renders the top header of the home dashboard. It delegates
 * all scroll detection, authentication logic, and edit mode state management to its
 * dedicated headless hook (`useHeaderLogic`).
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.data - An array of statistical data objects to display (contains title, value, logo).
 * @param {boolean} props.isEditing - State indicating if the dashboard is currently in edit mode.
 * @param {boolean} props.checkChanges - State indicating if there are unsaved changes pending validation.
 * @param {Function} props.onEnableEdit - Function to enable edit mode.
 * @param {Function} props.onDisableEdit - Function to disable edit mode.
 * @param {Function} props.onSaveLayout - Function to persist layout modifications to the backend.
 * @returns {JSX.Element|null} The rendered header component, or null if data is invalid.
 */
export const Header = ({ data, isEditing, checkChanges, onEnableEdit, onDisableEdit, onSaveLayout }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Header Data & Action Handlers
     *
     * Extracts the resolved UI states (like scroll detection) and mapped interaction handlers
     * (like logout and edit toggles) from the headless logic hook.
     */
    const { headerStates, headerActions } = useHeaderLogic({ onEnableEdit, onDisableEdit, onSaveLayout });

    const { isScrolled } = headerStates;
    const { handleLogout, handleEnableEditMode, handleDisableEditMode, handleSaveLayout, handleNavigateToSettings, handleMobileNavigateToSettings } = headerActions;

    // --- 2. Render ---

    if (!data || !Array.isArray(data)) return null;

    return (
        <>
            {/* Desktop Header Container */}
            <header className="w-full bg-primary shadow-md rounded-[2.5rem] hidden md:flex justify-between px-8 py-6 items-start">
                {/* Left Section: User Avatar & Statistics Grid */}
                <div className="h-fit flex-1 flex items-center justify-start gap-14">
                    {/* User Avatar Container */}
                    <button
                        type="button"
                        onClick={handleNavigateToSettings}
                        className="relative h-36 w-36 flex items-center justify-center p-2 rounded-full overflow-hidden border-[3px] border-primary-600 shrink-0 cursor-pointer"
                    >
                        <div className="h-full w-full bg-primary-600/40 rounded-full overflow-hidden">
                            <img
                                className="w-full h-full object-cover shadow-md"
                                src="/public/Avatar_0.jpg"
                                alt="User Avatar"
                            />
                        </div>
                    </button>

                    {/* Desktop Statistics Grid */}
                    <div className="grid grid-cols-2 gap-x-10 gap-y-7 w-auto">
                        {data.map((option, index) => {
                            /**
                             * Resolved Icon Component
                             *
                             * Retrieves the matching icon from ICON_MAP, falling back to a default clipboard icon.
                             */
                            const IconComponent = ICON_MAP[option.logo] || IconClipboardTextFilled;

                            return (
                                <div key={index} className="flex items-center gap-4 text-quaternary-700">
                                    {/* Icon Wrapper */}
                                    <div className="bg-primary-300 p-3 rounded-2xl shadow-sm flex-shrink-0">
                                        <IconComponent className="h-8 w-8 text-primary" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium text-quaternary-500">
                                            {option.title}
                                        </span>
                                        <span className="text-3xl font-extrabold leading-none mt-1">
                                            {option.value}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Section: AI Assistant & Edit Actions */}
                <div className="flex gap-4 items-center shrink-0">
                    <div className="w-fit h-fit flex flex-col items-center justify-between gap-2">
                        {/* SabidurIA Assistant Logo */}
                        <img
                            className="w-14 h-14 cursor-pointer hover:scale-105 transition-transform duration-200"
                            src={logoSabidurIA}
                            alt="Icono Dios de la Sabiduría"
                        />

                        {/* Edit Mode Toggle Container */}
                        <div
                            className={`relative flex flex-col items-center justify-center transition-all duration-300 ease-in-out text-primary-600/70 overflow-hidden ${isEditing ? "h-[76px]" : "h-9"} w-9`}
                        >
                            {/* Enable Edit Mode Button */}
                            <div
                                className={`absolute flex items-center justify-center w-full h-full cursor-pointer hover:text-primary-600 transition-all duration-300
                                    ${!isEditing ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}
                                `}
                                onClick={handleEnableEditMode}
                            >
                                <IconEditFilled className="w-full h-full" />
                            </div>

                            {/* Active Edit Mode Controls (Save/Cancel) */}
                            <div
                                className={`absolute flex flex-col items-center justify-between h-full w-full transition-all duration-300 ${isEditing ? "opacity-100 scale-100" : "opacity-0 pointer-events-none"}`}
                            >
                                {/* Confirm / Cancel Edit Button */}
                                <div
                                    className="w-full h-1/2 cursor-pointer hover:text-primary-600 transition-all"
                                    onClick={checkChanges ? handleSaveLayout : handleDisableEditMode}
                                >
                                    {!checkChanges ? (
                                        <IconSquareRoundedXFilled className="w-full h-full" />
                                    ) : (
                                        <IconSquareRoundedCheckFilled className="w-full h-full" />
                                    )}
                                </div>
                                {/* Additional Edit Action (Placeholder) */}
                                <div className="w-full h-1/2 cursor-pointer hover:text-primary-600 transition-all mt-1">
                                    <IconSquareRoundedPlus className="w-full h-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Header Container */}
            <header
                className={`w-full bg-primary shadow-md rounded-[2.5rem] md:hidden flex flex-col justify-between px-5 transition-all duration-500 ease-in-out items-start ${
                    isScrolled ? "py-3" : "py-6 gap-5"
                }`}
            >
                {/* Top Row: User Avatar & Actions */}
                <div className="h-fit flex-1 w-full flex items-center justify-between transition-all duration-500 ease-in-out">
                    {/* Shrinkable Mobile User Avatar */}
                    <button
                        type="button"
                        onClick={handleMobileNavigateToSettings}
                        className="relative flex items-center justify-center p-1.5 rounded-full overflow-hidden border-[3px] border-primary-600 shrink-0 transition-all duration-500 h-16 w-16">
                        <div className="h-full w-full bg-primary-600/40 rounded-full overflow-hidden cursor-pointer">
                            <img
                                className="w-full h-full object-cover shadow-md"
                                src="/public/Avatar_0.jpg"
                                alt="User Avatar"
                            />
                        </div>
                    </button>

                    {/* Mobile Action Controls (AI & Logout) */}
                    <div className="flex items-center gap-3 shrink-0">
                        <img
                            className={`cursor-pointer hover:scale-105 transition-all duration-500 ${isScrolled ? "w-8 h-8" : "w-10 h-10"}`}
                            src={logoSabidurIA}
                            alt="Icono Dios de la Sabiduría"
                        />
                        <IconLogout
                            className={`text-primary-600 cursor-pointer transition-all duration-500 ${isScrolled ? "w-8 h-8" : "w-10 h-10"}`}
                            strokeWidth={1.5}
                            onClick={handleLogout}
                        />
                    </div>
                </div>

                {/* Bottom Row: Collapsible Statistics Grid */}
                <div
                    className={`grid transition-all duration-500 ease-in-out w-full ${
                        isScrolled ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                    }`}
                >
                    {/* Overflow Wrapper for Fluid Collapse */}
                    <div className="overflow-hidden min-h-0 w-full">
                        <div className="grid grid-cols-2 w-full gap-3">
                            {data.map((option, index) => {
                                /**
                                 * Resolved Icon Component
                                 *
                                 * Retrieves the matching icon from ICON_MAP, falling back to a default clipboard icon.
                                 */
                                const IconComponent = ICON_MAP[option.logo] || IconClipboardTextFilled;

                                return (
                                    <div key={index} className="flex items-center gap-3 text-quaternary-700 min-w-0">
                                        {/* Mobile Icon Wrapper */}
                                        <div className="bg-primary-300 p-2.5 rounded-xl shadow-sm flex-shrink-0">
                                            <IconComponent className="h-5 w-5 text-primary" />
                                        </div>

                                        {/* Mobile Text Content */}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-[11px] font-medium text-quaternary-500 leading-tight truncate">
                                                {option.title}
                                            </span>
                                            <span className="text-lg font-extrabold leading-none mt-0.5 truncate">
                                                {option.value}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};
