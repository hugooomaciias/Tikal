/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useNavbarLogic } from "../../../../hooks/components/app/main/common/useNavbarLogic.js";

/** Components & Layouts */

/** Icons */
import {
    IconHome,
    IconListFilled,
    IconCalendarWeekFilled,
    IconChartBar,
    IconPyramid,
    IconUsersGroup,
} from "@tabler/icons-react";

/**
 * Icon Component Map
 *
 * A static dictionary linking string keys to their corresponding React icon components.
 * Declared outside the component to prevent unnecessary object recreation during re-renders.
 */
const ICON_MAP = {
    IconHome,
    IconListFilled,
    IconCalendarWeekFilled,
    IconChartBar,
    IconPyramid,
    IconUsersGroup,
};

/**
 * Navbar Component
 *
 * This purely visual component renders the main navigation sidebar for the application.
 * On desktop, it functions as an expandable vertical sidebar containing navigation links
 * and user session controls. On mobile, it acts as a compact horizontal bottom bar.
 * It explicitly delegates all its business logic, URL watching, and state management 
 * to the `useNavbarLogic` headless hook.
 *
 * @component
 * @returns {JSX.Element|null} The rendered navigation bar component, or null if user data is missing.
 */
export const NavbarComponent = ({ theme }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * UI Data & Action Handlers
     *
     * Extracts the translation instance, UI states (e.g., expanded layout), derived navigation configuration,
     * user profile data, and the interaction handlers from the centralized headless logic hook.
     */
    const { t, navbarStates, navbarData, navbarActions } = useNavbarLogic();

    const { isExpanded } = navbarStates;
    const { navbarOptions, activeTab, userProfile } = navbarData;
    const { trackerActions, handleLogout, handleToggleSidebar, handleNavigateToSettings } = navbarActions;

    // --- 2. Render ---

    if (!userProfile) return null;

    return (
        <aside
            className={`${theme} flex ${theme ? "bg-rank-900/80 border-rank-700/50 backdrop-blur-sm text-rank" : "bg-primary-300 text-primary"} shadow-2xl transition-all duration-[300ms] shrink-0 z-50 flex-col p-5 justify-between rounded-[3rem] h-full max-md:order-last max-md:flex-row max-md:w-full max-md:h-[72px] max-md:p-2 max-md:rounded-[2rem] max-md:items-center max-md:justify-around ${isExpanded ? "w-72" : "w-[104px]"}`}
        >
            {/* Top Logo Container */}
            <div
                className={`hidden h-10 w-auto md:flex items-center gap-12 cursor-pointer ${isExpanded ? "justify-between" : "justify-center"}`}
                onClick={handleToggleSidebar}
            >
                {/* Brand Logo Image */}
                <div className="h-full w-16 shrink-0 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                    <div
                        className={`w-full h-full bg-primary`} 
                        style={{
                            maskImage: "url(/tikal/logoHeader_2.svg)",
                            WebkitMaskImage: "url(/tikal/logoHeader_2.svg)",
                            maskRepeat: "no-repeat",
                            WebkitMaskRepeat: "no-repeat",
                            maskSize: "contain",
                            WebkitMaskSize: "contain",
                            maskPosition: "center",
                            WebkitMaskPosition: "center",
                        }}
                    />
                </div>

                {/* Expanded Brand Name */}
                {isExpanded && <span className={`${theme ? "text-rank" : "text-primary" } text-3xl font-bold tracking-[0.3em]`}>TIKAL</span>}
            </div>

            {/* Navigation Links Container */}
            <nav
                className={`w-full flex flex-row md:flex-col justify-center gap-8 ${isExpanded ? "items-start" : "items-center"}`}
            >
                {/* Dynamic Options List */}
                {navbarOptions.map((option, index) => {
                    const IconComponent = ICON_MAP[option.icon];
                    const isActive = activeTab === option.title;

                    return (
                        <Link
                            key={index}
                            to={option.to}
                            onClick={(e) => {
                                if (option.to === "/temple-mode") {
                                    e.preventDefault(); 
                                    trackerActions.handleRequestTempleModeEntry();
                                }
                            }}
                            className={`flex items-center gap-6 transition-all duration-200 ${isActive ? (theme ? "text-rank-400" : "text-primary") : (theme ? "text-rank hover:text-rank-100" : "text-primary-500 hover:text-primary-200")}`}
                        >
                            <IconComponent className="h-8 w-8" />

                            {/* Expanded Label Text */}
                            {isExpanded && (
                                <span className="text-2xl font-light tracking-[0.05em] whitespace-nowrap">
                                    {option.title}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Action (User Profile & Logout) */}
            <div
                className={`hidden md:flex h-fit w-full ${theme ? "bg-rank" : "bg-primary"} rounded-full mx-auto transition-colors duration-200 items-center mt-8 p-2 ${isExpanded ? "w-full justify-start p-3" : "w-fit justify-center p-2"}`}
            >
                {/* User Avatar Container */}
                <button
                    type="button"
                    onClick={handleNavigateToSettings}
                    className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden cursor-pointer"
                >
                    <img
                        className="w-full h-full object-cover shadow-md"
                        src={userProfile.avatarUrl}
                        alt="User Avatar"
                    />
                </button>

                {/* User Information and Actions */}
                {isExpanded && (
                    <div className={`flex flex-col ml-4 overflow-hidden ${theme === "theme-rank-3" ? "text-rank-700" : theme ? "text-rank-600" : "text-primary-600"} `}>
                        <span className="text-lg font-medium whitespace-nowrap">
                            {userProfile.name}
                        </span>
                        <span
                            onClick={handleLogout}
                            className="cursor-pointer whitespace-nowrap hover:underline"
                        >
                            {t("navbar.logout")}
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};
