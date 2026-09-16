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
    IconLayoutDashboard,
    IconMessageCircle,
    IconCircleXFilled
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
    IconLayoutDashboard,
    IconMessageCircle
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
export const NavbarComponent = ({ theme, isMobileMenuOpen, onCloseMobileMenu }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * UI Data & Action Handlers
     *
     * Extracts the translation instance, UI states (e.g., expanded layout), derived navigation configuration,
     * user profile data, and the interaction handlers from the centralized headless logic hook.
     */
    const { t, navbarStates, navbarData, navbarActions } = useNavbarLogic({ onCloseMobileMenu, isMobileMenuOpen });

    const { isExpanded, isTeamsOpen, isFloatingTeamsOpen } = navbarStates;
    const { navbarOptions, activeTab, userProfile } = navbarData;
    const { trackerActions, handleLogout, handleToggleSidebar, handleNavigateToSettings, handleToggleTeams, handleCloseFloatingMenu } = navbarActions;

    // --- 2. Render ---

    if (!userProfile) return null;

    return (
        <aside
            className={`
                ${theme ? "bg-rank-900/90 border-rank-700/50 backdrop-blur-md text-rank" : "bg-primary-300 text-primary"} 
                flex flex-col shadow-2xl transition-transform duration-[300ms] ease-out shrink-0 z-40 justify-between
                
                /* DESKTOP STYLES */
                md:relative md:h-full md:p-5 md:rounded-[3rem] md:translate-x-0 ${isExpanded ? "md:w-72" : "md:w-[104px]"}
                
                /* MOBILE STYLES */
                max-md:fixed max-md:top-0 max-md:left-0 max-md:w-full max-md:h-[100dvh] max-md:p-8 max-md:rounded-none max-md:overflow-y-auto
                ${isMobileMenuOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
            `}
        >
            {/* Top Logo Container */}
            <div
                onClick={handleToggleSidebar}
                className={`flex h-10 w-auto items-center cursor-pointer`}
            >
                {/* Brand Logo Image */}
                <div className={`h-full w-full flex items-center gap-3 ${isMobileMenuOpen ? "justify-start" : isExpanded ? "justify-between" : "justify-center"}`}>
                    <div className="h-full w-16 shrink-0 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
                        <div
                            className="w-full h-full bg-primary" 
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
                    {(isExpanded || isMobileMenuOpen) && <span className={`${theme ? "text-rank" : "text-primary" } text-3xl font-bold tracking-[0.3em]`}>TIKAL</span>}
                </div>

                {/* Mobile Close Button */}
                {isMobileMenuOpen && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onCloseMobileMenu();
                        }}
                        className="text-primary transition-colors p-2 rounded-full"
                    >
                        <IconCircleXFilled className="w-10 h-10" />
                    </button>
                )}
            </div>

            {/* Navigation Links Container */}
            <nav
                className={`w-full flex flex-col justify-center gap-8 ${(isExpanded || isMobileMenuOpen) ? "items-start" : "items-center"}`}
            >
                {/* Dynamic Options List */}
                {navbarOptions.map((option, index) => {
                    const IconComponent = ICON_MAP[option.icon];
                    const isActive = activeTab === option.title;

                    let colorClasses = "";
                    if (theme) {
                        colorClasses = isActive || (option.hasSubmenu && (isTeamsOpen || isFloatingTeamsOpen))
                            ? "text-rank-400" 
                            : "text-rank hover:text-rank-100";
                    } else {
                        colorClasses = isActive || (option.hasSubmenu && (isTeamsOpen || isFloatingTeamsOpen))
                            ? "text-primary" 
                            : "text-primary-500 hover:text-primary-200";
                    }

                    if (option.hasSubmenu) {
                        return (
                            <div key={index} className="relative w-full">
                                {/* Teams button */}
                                <button
                                    type="button"
                                    onClick={() => handleToggleTeams(option.subItems[0].to)}
                                    className={`w-full flex items-center justify-center gap-6 transition-all duration-200 cursor-pointer ${(isExpanded || isMobileMenuOpen) && isTeamsOpen ? "bg-primary-50 rounded-t-[1rem] p-3 text-primary-500" : "text-primary"} ${colorClasses}`}
                                >
                                    <IconComponent className="h-8 w-8 shrink-0" />

                                    {(isExpanded || isMobileMenuOpen) && (
                                        <span className="text-2xl font-light tracking-[0.05em] whitespace-nowrap flex-1 text-left">
                                            {option.title}
                                        </span>
                                    )}
                                </button>

                                {/* Teams subitems when Navbar is expanded */}
                                {(isExpanded || isMobileMenuOpen) && isTeamsOpen && (
                                    <div className="w-full flex flex-col gap-2 bg-primary-50 text-primary-600 rounded-b-[1rem] pt-0 pr-3 pb-3 pl-2 animate-fade-in-up">
                                        {option.subItems.map((sub, subIdx) => {
                                            const SubIcon = ICON_MAP[sub.icon];
                                            const isSubActive = location.pathname === sub.to;

                                            return (
                                                <Link
                                                    key={subIdx}
                                                    to={sub.to}
                                                    onClick={() => {
                                                        handleCloseFloatingMenu();
                                                        if (isMobileMenuOpen && onCloseMobileMenu) {
                                                            onCloseMobileMenu();
                                                        }
                                                    }}
                                                    className={`flex items-center gap-4 px-2 p-1 rounded-lg text-lg font-medium transition-colors ${isSubActive ? "bg-primary-300 text-primary-50" : "text-primary-500"}`}
                                                >
                                                    <SubIcon className="h-6 w-6" />
                                                    <span>{sub.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Teams subitems when Navbar is not expanded */}
                                {(!isExpanded && !isMobileMenuOpen) && isFloatingTeamsOpen && (
                                    <div className="md:w-fit absolute -right-9 md:left-full -top-28 md:-top-9 flex flex-col gap-3 bg-primary-300 p-2 md:p-3 md:pr-2 rounded-t-2xl md:rounded-r-2xl z-50 animate-fade-in-up">
                                        {option.subItems.map((sub, subIdx) => {
                                            const SubIcon = ICON_MAP[sub.icon];
                                            const isSubActive = location.pathname === sub.to;

                                            return (
                                                <Link
                                                    key={subIdx}
                                                    to={sub.to}
                                                    onClick={() => handleCloseFloatingMenu() }
                                                    className={`flex items-center gap-3 px-2 p-1 rounded-lg text-lg font-medium transition-colors ${isSubActive ? "bg-primary-300 text-primary-50" : "text-primary-500"}`}
                                                >
                                                    <SubIcon className="h-6 w-6" />
                                                    <span>{sub.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

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
                            {(isExpanded || isMobileMenuOpen) && (
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
                className={`flex h-fit w-full ${theme ? "bg-rank" : "bg-primary"} rounded-full mx-auto transition-colors duration-200 items-center mt-8 p-2 ${(isExpanded || isMobileMenuOpen) ? "w-full justify-start p-3" : "w-fit justify-center p-2"}`}
            >
                {/* User Avatar Container */}
                <button
                    type="button"
                    onClick={handleNavigateToSettings}
                    className="tour-settings relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden cursor-pointer"
                >
                    <img
                        className="w-full h-full object-cover shadow-md"
                        src={userProfile.avatarUrl}
                        alt="User Avatar"
                    />
                </button>

                {/* User Information and Actions */}
                {((isExpanded || isMobileMenuOpen) || isMobileMenuOpen) && (
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
