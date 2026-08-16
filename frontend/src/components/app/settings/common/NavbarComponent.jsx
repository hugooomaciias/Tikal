/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useNavbarLogic } from "../../../../hooks/components/app/settings/common/useNavbarLogic.js";

/** Components & Layouts */

/** Icons */
import {
    IconUser,
    IconSettings,
    IconPyramid,
    IconBell,
    IconUsersGroup,
    IconLogout2,
} from "@tabler/icons-react";

/**
 * Icon Component Map
 *
 * A static dictionary linking string keys to their corresponding React icon components.
 * Declared outside the component to prevent unnecessary object recreation during re-renders.
 */
const ICON_MAP = {
    IconUser,
    IconSettings,
    IconPyramid,
    IconBell,
    IconUsersGroup,
};

/**
 * Settings Navbar Component
 *
 * This purely visual component renders the dedicated navigation sidebar for the Settings section.
 * On desktop, it acts as a fixed-width vertical menu navigating through configuration panels. 
 * On mobile, it automatically transforms into a compact horizontal bottom bar. It explicitly 
 * delegates active tab resolution and routing logic to the `useNavbarLogic` headless hook.
 *
 * @component
 * @returns {JSX.Element} The rendered navigation bar component.
 */
export const NavbarComponent = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * UI Data Extraction
     *
     * Extracts the pre-processed and memoized navigation options array, along with the dynamically 
     * resolved active tab identifier from the centralized headless logic hook.
     */
    const { t, navbarData, navbarActions } = useNavbarLogic();
    const { navbarOptions, activeTab } = navbarData;
    const { handleLogout } = navbarActions;

    // --- 2. Render ---

    return (
        <aside className="w-full md:w-fit flex flex-col justify-between bg-primary md:bg-primary-300 text-primary transition-all duration-300 shrink-0 z-50 p-8 md:p-5 rounded-[2.5rem] h-full">
            {/* Navigation Links Container */}
            <nav className="w-full flex flex-col gap-8 items-start mt-4 md:mt-0">
                {/* Dynamic Options List */}
                {navbarOptions.map((option, index) => {
                    const IconComponent = ICON_MAP[option.icon];
                    const isActive = activeTab === option.title;

                    return (
                        <Link
                            key={index}
                            to={option.to}
                            className={`flex items-center gap-6 transition-all duration-200 ${isActive ? "text-primary-50" : "text-primary-500 hover:text-primary-200"}`}
                        >
                            <IconComponent className="h-6 w-6 md:h-8 md:w-8" />

                            {/* Expanded Label Text */}
                            <span className="text-xl md:text-2xl font-light tracking-[0.05em] whitespace-nowrap">
                                {option.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between bg-primary-300 md:bg-primary rounded-full px-5 py-3 md:px-4 md:py-2 text-primary md:text-primary-500 overflow-hidden hover:bg-primary-100 transition-colors mt-8 shrink-0"
            >
                <IconLogout2 className="w-6 h-6 md:w-5 md:h-5 shrink-0" />
                <span className="text-lg font-medium whitespace-nowrap">
                    {t("settings.navbar.logout")}
                </span>
            </button>
        </aside>
    );
};
