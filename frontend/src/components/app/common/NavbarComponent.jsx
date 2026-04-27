/** React & Third-Party Libraries */
import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Contexts, Hooks & Services */
import { AuthContext } from "../../../context/AuthContext.jsx";

/** Icons */
import {
    IconHome,
    IconListFilled,
    IconCalendarWeekFilled,
    IconChartBar,
    IconPyramid,
    IconUsersGroup,
} from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoNavbar from "../../../assets/tikal/logoHeader_2.svg";

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
 * This component renders the main navigation sidebar for the application.
 * On desktop, it functions as an expandable vertical sidebar containing navigation links
 * and user session controls. On mobile, it acts as a compact horizontal bottom bar.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.data - The user profile data object used to display name and information.
 * @returns {JSX.Element|null} The rendered navigation bar component, or null if user data is missing.
 */
export const NavbarComponent = ({ data }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_common"
     * namespace to localize navbar text content dynamically.
     */
    const { t } = useTranslation("app_common");

    /**
     * Authentication Context
     *
     * Provides the 'logout' function to allow the user to properly end their session.
     */
    const { logout } = useContext(AuthContext);

    /**
     * Programmatic Navigation Hook
     *
     * Enables programmatic routing capabilities, such as redirecting the user
     * back to the login page after their session terminates.
     */
    const navigate = useNavigate();

    /**
     * Location Hook
     *
     * Subscribes to the router's location object. Used to watch for path changes
     * so the active tab can be synchronized with the current browser URL.
     */
    const location = useLocation();

    // --- 2. Local State ---

    /**
     * Sidebar Expanded State
     *
     * Controls the visual state of the sidebar on desktop screens. When true,
     * the sidebar expands to reveal labels and additional user information.
     */
    const [isExpanded, setIsExpanded] = useState(false);

    // --- 3. Derived Variables ---

    /**
     * Navigation Options
     *
     * Configuration array for rendering the navigation links located in the sidebar.
     * Includes their localized titles and corresponding icon keys.
     */
    const navbarOptions = [
        { icon: "IconHome", title: t("navbar.home"), to: "/home" },
        { icon: "IconListFilled", title: t("navbar.tasks"), to: "/tasks" },
        { icon: "IconCalendarWeekFilled", title: t("navbar.calendar"), to: "/calendar" },
        { icon: "IconChartBar", title: t("navbar.statistics"), to: "/statistics" },
        { icon: "IconPyramid", title: t("navbar.temple_mode"), to: "/home" },
        { icon: "IconUsersGroup", title: t("navbar.groups"), to: "/home" },
    ];

    /**
     * Current Navigation Option
     *
     * Resolves the navigation configuration object that corresponds to the active browser URL.
     */
    const currentOption = navbarOptions.find((option) => option.to === location.pathname);

    /**
     * Active Tab Title
     *
     * Derives the title of the currently selected navigation tab to apply
     * active styling to the corresponding link. Evaluated entirely from the URL state.
     */
    const activeTab = currentOption ? currentOption.title : "";

    // --- 5. Event Handlers & Functions ---

    /**
     * Logout Handler
     *
     * Asynchronously terminates the user session through the auth context
     * and redirects the user back to the login page. Logs an error if it fails.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    /**
     * Toggle Sidebar Handler
     *
     * Expands or collapses the desktop sidebar interface.
     *
     * @returns {void}
     */
    const handleToggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    // --- 6. Render ---

    if (!data) return null;

    return (
        <aside
            className={`flex bg-primary-300 text-primary shadow-2xl transition-all duration-[300ms] shrink-0 z-50 flex-col p-5 justify-between rounded-[3rem] h-full max-md:order-last max-md:flex-row max-md:w-full max-md:h-[72px] max-md:p-2 max-md:rounded-[2rem] max-md:items-center max-md:justify-around ${isExpanded ? "w-72" : "w-[104px]"}`}
        >
            {/* Top Logo Container */}
            <div
                className={`hidden h-10 w-auto md:flex items-center gap-12 cursor-pointer ${isExpanded ? "justify-between" : "justify-center"}`}
                onClick={handleToggleSidebar}
            >
                {/* Brand Logo Image */}
                <img
                    className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                    src={logoNavbar}
                    alt="Logo Tikal"
                />

                {/* Expanded Brand Name */}
                {isExpanded && <span className="text-primary-50 text-3xl font-bold tracking-[0.3em]">TIKAL</span>}
            </div>

            {/* Navigation Links Container */}
            <nav
                className={`w-full flex flex-row md:flex-col justify-center gap-8 ${isExpanded ? "items-start" : "items-center"}`}
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
                className={`hidden md:flex h-fit w-full bg-primary-50 rounded-full mx-auto transition-colors duration-200 items-center mt-8 p-2 ${isExpanded ? "w-full justify-start p-3" : "w-fit justify-center p-2"}`}
            >
                {/* User Avatar Container */}
                <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-[3px] border-primary-300 cursor-pointer">
                    <img
                        className="w-full h-full object-cover shadow-md"
                        src="/public/Avatar_0.svg"
                        alt="User Avatar"
                    />
                </div>

                {/* User Information and Actions */}
                {isExpanded && (
                    <div className="flex flex-col ml-4 overflow-hidden">
                        <span className="text-primary-600 text-lg font-medium whitespace-nowrap">{data.name}</span>
                        <span
                            onClick={handleLogout}
                            className="text-primary-600 cursor-pointer whitespace-nowrap hover:underline"
                        >
                            {t("navbar.logout")}
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};
