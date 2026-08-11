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
    const { navbarData } = useNavbarLogic();
    const { navbarOptions, activeTab } = navbarData;

    // --- 2. Render ---

    return (
        <aside
            className="w-fit flex bg-primary-300 text-primary transition-all duration-[300ms] shrink-0 z-50 flex-col p-5 justify-between rounded-[2.5rem] h-full max-md:order-last max-md:flex-row max-md:w-full max-md:h-[72px] max-md:p-2 max-md:rounded-[2rem] max-md:items-center max-md:justify-around"
        >
            {/* Navigation Links Container */}
            <nav
                className="w-full flex flex-row md:flex-col justify-center gap-8 items-start"
            >
                {/* Dynamic Options List */}
                {navbarOptions.map((option, index) => {
                    /**
                     * Resolved Icon Component
                     *
                     * Dynamically resolves the required React icon for the current navigation option.
                     */
                    const IconComponent = ICON_MAP[option.icon];

                    /**
                     * Active State Flag
                     *
                     * Boolean flag determining if the current option corresponds to the active tab.
                     */
                    const isActive = activeTab === option.title;

                    return (
                        <Link
                            key={index}
                            to={option.to}
                            className={`flex items-center gap-6 transition-all duration-200 ${isActive ? "text-primary-50" : "text-primary-500 hover:text-primary-200"}`}
                        >
                            <IconComponent className="h-8 w-8" />

                            {/* Expanded Label Text */}
                            <span className="text-2xl font-light tracking-[0.05em] whitespace-nowrap">
                                {option.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};
