/** React & Third-Party Libraries */
import { Outlet } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useBaseLogic } from "../../../hooks/components/app/main/useBaseLogic.js";

/** Components & Layouts */
import { NavbarComponent } from "../../../components/app/main/common/NavbarComponent.jsx";

/**
 * Main Application Base Layout
 *
 * This structural component acts as the persistent layout wrapper for the standard 
 * authenticated routes (e.g., Home, Tasks, Calendar, Statistics). It establishes the 
 * overarching page shell, maintaining the global navigation sidebar, and delegates the 
 * dynamic injection of child page content via React Router's `<Outlet />` component.
 *
 * @component
 * @returns {JSX.Element} The rendered layout shell containing the routing outlet.
 */
export const MainBasePage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Base Layout State & Derived Data
     *
     * Extracts the core layout states (such as mobile viewport detection and sidebar 
     * visibility) and dynamic styling configurations (like Temple Mode constraints 
     * and conditional CSS layout classes) directly from the headless logic hook. 
     * This keeps the root structural shell purely presentational.
     */
    const { basePageStates, basePageData, basePageActions } = useBaseLogic();

    const { isMobileMenuOpen, isMobile } = basePageStates;
    const { isTempleMode,  isTeams, isTeamProjects, layoutClasses } = basePageData;
    const {  handleOpenMobileMenu, handleCloseMobileMenu  } = basePageActions;

    // --- 2. Render ---

    return (
        <div className={layoutClasses}>
            {/* Vertical Navbar */}
            {!isTempleMode && (
                <NavbarComponent
                    isMobileMenuOpen={isMobileMenuOpen}
                    onCloseMobileMenu={() => handleCloseMobileMenu()}
                />
            )}

            {/* Main Content Area */}
            <section className={`flex-1 flex flex-col w-full h-full overflow-hidden ${(isTeams || isTeamProjects) ? "gap-2 md:gap-4" : !isTempleMode ? "gap-4 md:gap-6" : ""}`}>
                <Outlet context={{ isMobile, isMobileMenuOpen, onOpenMobileMenu: () => handleOpenMobileMenu(), onCloseMobileMenu: () => handleCloseMobileMenu() }} />
            </section>
        </div>
    );
};
