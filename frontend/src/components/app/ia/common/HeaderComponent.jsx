/** React & Third-Party Libraries */
import { useNavigate } from "react-router-dom";

/** Icons */
import { IconMenu2 } from "@tabler/icons-react";

/**
 * AI Module Header Component
 *
 * A structural visual component specifically designed for the AI layout ("Dios de la SabidurIA").
 * It displays the module's branding title and provides a global navigation action
 * to return to the main application dashboard (Home). It also includes a mobile-specific
 * toggle button to open the hidden navigation sidebar.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onOpen - Callback function triggered to open the mobile navigation menu.
 * @returns {JSX.Element} The rendered AI header component.
 */
export const HeaderComponent = ({ onOpen }) => {
    // --- 1. Local UI Logic ---

    /**
     * Programmatic Navigation Hook
     *
     * Provides the navigate function to programmatically redirect the user
     * back to the main dashboard after clicking the application logo.
     */
    const navigate = useNavigate();

    /**
     * Navigate to Home Handler
     *
     * Redirects the user from the settings layout back to the primary authenticated dashboard.
     */
    const handleNavigateToHome = () => {
        navigate("/home");
    };

    // --- 3. Render ---

    return (
        <>
            {/* Main Header Container */}
            <div className="flex items-center justify-between mb-4">
                {/* IA title */}
                <div className="h-full flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpen}
                        className="md:hidden shrink-0 bg-primary p-3 rounded-full text-primary-600 shadow-md transition-transform  z-20"
                    >
                        <IconMenu2 className="w-6 h-6" />
                    </button>

                    <div className="h-full w-fit flex items-center justify-center rounded-full bg-primary px-5">
                        <span className="text-xl md:text-2xl xl:text-3xl font-passero font-bold text-primary-600 tracking-widest">Dios de la SabidurIA</span>
                    </div>
                </div>

                {/* Return home button */}
                <div className="h-full w-auto flex items-center gap-6">
                    <button
                        type="button"
                        onClick={handleNavigateToHome}
                        className="h-12 w-12 md:h-14 md:w-14 xl:h-20 xl:w-20 bg-primary p-3 rounded-full shadow-md"
                    >

                        <div
                            className={`w-full h-full bg-primary-600`} 
                            style={{
                                maskImage: "url(/tikal/logoHeader_1.svg)",
                                WebkitMaskImage: "url(/tikal/logoHeader_1.svg)",
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                            }}
                        />
                    </button>
                </div>
            </div>
        </>
    );
};
