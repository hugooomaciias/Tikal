/** React & Third-Party Libraries */
import { Outlet } from "react-router-dom";

/** Components & Layouts */
import { NavbarComponent } from "../../../components/app/main/common/NavbarComponent.jsx";

/**
 * Main Application Dashboard Component
 *
 * This purely visual component acts as the primary layout wrapper for the authenticated area.
 * It renders the responsive grid layout where widgets are dynamically injected. All data fetching,
 * state management, and grid modification logic (such as dragging and resizing) are entirely delegated
 * to its dedicated headless hook (`useHomeLogic`).
 *
 * @component
 * @returns {JSX.Element|null} The rendered dashboard layout, or null if data is not loaded.
 */
export const MainBasePage = () => {
    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar */}
            <NavbarComponent />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                <Outlet />
            </section>
        </div>
    );
};
