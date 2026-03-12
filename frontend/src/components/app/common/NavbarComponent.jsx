/** React & Third-Party Libraries */
import { useState, useContext, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"

/** Components */
import { AuthContext } from "../../../context/AuthContext.jsx"

/** Assets & Icons */
import { IconHome, IconListFilled, IconCalendarWeekFilled, IconChartBar, IconPyramid, IconUsersGroup } from '@tabler/icons-react';

/**
 * Navbar Component
 *
 * This component renders the main navigation sidebar for the application.
 * On desktop, it functions as an expandable vertical sidebar containing navigation links
 * and user session controls. On mobile, it acts as a compact horizontal bottom bar.
 *
 * @component
 * @returns {JSX.Element} The rendered navigation bar component.
 */
export const NavbarComponent = () => {
    /**
     * Authentication Context
     *
     * Provides the 'logout' function to allow the user to properly end their session.
     */
    const { logout } = useContext(AuthContext);
	
    /**
     * Hook for programmatic navigation.
     */
	const navigate = useNavigate();

    const location = useLocation();

    /**
     * Sidebar Expanded State
     *
     * Controls the visual state of the sidebar on desktop screens. When true,
     * the sidebar expands to reveal labels and additional user information.
     */
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Active Tab State
     *
     * Stores the title of the currently selected navigation tab to apply
     * active styling to the corresponding link.
     */
	const [activeTab, setActiveTab] = useState("");

    /**
     * Logout Handler
     *
     * Asynchronously terminates the user session through the auth context
     * and redirects the user back to the login page. Logs an error if it fails.
     *
     * @async
     * @function
     */
    const handleLogout = async () => {
		try {
			await logout();
			navigate('/login');
		} catch (error) {
			console.error('Error al cerrar sesión', error);
		}
	};

    /**
     * Icon Component Map
     *
     * Maps string identifiers to their corresponding React icon components.
     * Used dynamically when rendering the navigation links below.
     */
    const iconMap = {
        "HomeIcon": IconHome,
        "ListIcon": IconListFilled,
        "CalendarIcon": IconCalendarWeekFilled,
        "ChartBarIcon": IconChartBar,
        "TempleIcon": IconPyramid,
        "GroupIcon": IconUsersGroup
    };

    /**
	 * Navigation Options
	 *
	 * Configuration array for rendering the navigation links located in the sidebar.
	 * Includes their titles and corresponding icon keys.
	 */
	const navbarOptions = [
		{ icon: "HomeIcon", title: "Inicio", to: "/home" },
		{ icon: "ListIcon", title: "Tareas", to: "/tasks" },
		{ icon: "CalendarIcon", title: "Calendario", to: "/home" },
		{ icon: "ChartBarIcon", title: "Estadísticas", to: "/home" },
		{ icon: "TempleIcon", title: "Modo Templo", to: "/home" },
		{ icon: "GroupIcon", title: "Grupos", to: "/home" },
	];

    useEffect(() => {
        const currentOption = navbarOptions.find(option => option.to === location.pathname);
        
        if (currentOption) {
            setActiveTab(currentOption.title);
        } else {
            setActiveTab("");
        }
    }, [location.pathname]);

    return (
        <aside className={`flex bg-primary-300 text-primary shadow-2xl transition-all duration-[300ms] shrink-0 z-50
                           flex-col p-5 justify-between rounded-[3rem] h-full
                           max-md:order-last max-md:flex-row max-md:w-full max-md:h-[72px] max-md:p-2 max-md:rounded-[2rem] max-md:items-center max-md:justify-around
                           ${isExpanded ? 'w-72' : 'w-[104px]'}`}
        >
            {/* Logo Section */}
            <div className={`hidden h-10 w-auto md:flex items-center  gap-12 cursor-pointer ${isExpanded ? 'justify-between' : 'justify-center'}`}
                    onClick={() => setIsExpanded(! isExpanded)}
            >
                <img className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" src="/public/logoHeader_2.svg" alt="Logo Tikal" />
                
                {/* Conditional rendering of the expanded logo text */}
                {isExpanded && (
                    <span className="text-primary-50 text-3xl font-bold tracking-[0.3em]">
                        TIKAL
                    </span>
                )}
            </div>
                
            {/* Navigation Links */}
            <nav className={`w-full flex flex-row md:flex-col justify-center gap-8 ${isExpanded ? 'items-start' : 'items-center'}`}>
                {navbarOptions.map((option, index) => {
                    const IconComponent = iconMap[option.icon];

                    const isActive = activeTab === option.title;

                    return (
                        <Link key={index} to={option.to} onClick={() => setActiveTab(option.title)}
                                className={`flex items-center gap-6 transition-all duration-200 ${isActive ? 'text-primary-50' : 'text-primary-500 hover:text-primary-200'}`}
                        >
                            <IconComponent className="h-8 w-8" />

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
            <div className={`hidden md:flex h-fit w-full bg-primary-50 rounded-full mx-auto transition-colors duration-200 items-center mt-8 p-2
                            ${isExpanded ? 'w-full justify-start p-3' : 'w-fit justify-center p-2'}`}
            >
                
                {/* User Avatar Container */}
                <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-[3px] border-primary-300 cursor-pointer">
                    <img className="w-full h-full object-cover shadow-md" src="/public/Avatar_0.svg" alt="Avatar Usuario" />
                </div>

                {/* User Information and Actions (Visible only on desktop when expanded) */}
                {isExpanded && (
                    <div className="flex flex-col ml-4 overflow-hidden">
                        <span className="text-primary-600 text-lg font-medium whitespace-nowrap">
                            Hugo
                        </span>
                        <span onClick={handleLogout} className="text-primary-600 cursor-pointer whitespace-nowrap hover:underline">
                            Cerrar sesión
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default NavbarComponent;