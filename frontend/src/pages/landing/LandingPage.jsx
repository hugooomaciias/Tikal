/** React & Third-Party Libraries */
import React from "react";

/** Contexts, Hooks & Services */
import { useLandingLogic } from "../../hooks/components/landing/useLandingLogic.js";

/** Components & Layouts */
import { HeroComponent } from "../../components/landing/HeroComponent.jsx";
import { PlansComponent } from "../../components/landing/PlansComponent.jsx";
import { ContactComponent } from "../../components/landing/contact/ContactComponent.jsx";
import { FooterComponent } from "../../components/landing/FooterComponent.jsx";
import { LanguagePickerComponent } from "../../components/landing/languagePickerComponent.jsx";

/** Icons */
import { IconMenu2Filled, IconX } from "@tabler/icons-react";

/**
 * Landing Page Presentational Component
 *
 * This component is a purely visual Headless UI consumer. It acts as the central
 * orchestrator for the single-page application layout, defining the visual hierarchy
 * and structural grid (sticky navigation, responsive mobile menu, content sections).
 *
 * All complex business logic, scroll spy mathematical calculations, dynamic theme
 * mapping, and deep linking state management are delegated entirely to its custom
 * headless hook (`useLandingLogic`).
 *
 * @component
 * @returns {JSX.Element} The rendered Landing Page skeleton and interactive UI sections.
 */
export const LandingPage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Headless Hook Destructuring
     *
     * Injects the localized translations (`t`), strictly typed UI states (scroll status, mobile menu),
     * memoized theme configurations (dynamic logo and background colors), and stable interaction
     * handlers from the logic layer into this presentational layer.
     */
    const { t, landingStates, landingTheme, landingActions } = useLandingLogic();

    const { isScrolled, isMobileMenuOpen, langSection } = landingStates;
    const { bgColour, logoColour, navbarBgColour, mobileTextColour, langBtnBgColour, langBtnTextColour } = landingTheme;
    const { toggleMobileMenu, closeMobileMenu, getLinkClasses } = landingActions;

    // --- 2. Render ---

    return (
        <div className="w-full relative">
            {/* Sticky Top Header Container */}
            <header
                className={`fixed z-50 top-0 right-0 left-0
								${bgColour} bg-opacity-80 backdrop-blur-md transition-all duration-500 ease-in-out
								${isScrolled && !isMobileMenuOpen ? "shadow-md" : ""}
								`}
            >
                <div className="w-full mx-auto flex items-center justify-between p-8">
                    {/* Brand Logo & Home Anchor */}
                    <a href="#home" className={getLinkClasses("home")}>
                        <img className="h-10 w-auto" src={`${logoColour}`} alt="Logo Tikal" />
                    </a>

                    {/* Desktop Navigation Links */}
                    <nav
                        className={`hidden h-10 md:flex items-center gap-6
									${navbarBgColour} font-semibold px-4 rounded-full transition-colors duration-500 shadow-md
									`}
                    >
                        <a href="#home" className={getLinkClasses("home")}>
                            {t("landing.nav.home")}
                        </a>
                        <a href="#plans" className={getLinkClasses("plans")}>
                            {t("landing.nav.plans")}
                        </a>
                        <a href="#contact" className={getLinkClasses("contact")}>
                            {t("landing.nav.contact")}
                        </a>
                    </nav>

                    {/* Mobile Menu Toggle Button */}
                    <div className="md:hidden z-50">
                        <button
                            className={`p-2 rounded-full focus:outline-none transition-colors
											${isMobileMenuOpen ? "absolute left-1/2 -translate-x-1/2 top-8" : "relative shadow-md " + navbarBgColour}
										`}
                            aria-label="Toggle mobile menu"
                            onClick={toggleMobileMenu}
                        >
                            {isMobileMenuOpen ? (
                                <IconX className={`h-6 w-6 ${mobileTextColour}`} />
                            ) : (
                                <IconMenu2Filled className={`h-6 w-6 ${mobileTextColour}`} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu Container */}
                <div
                    className={`absolute md:hidden z-40 top-0 left-0 w-full flex flex-col items-center justify-center gap-6
								${navbarBgColour} pt-24 pb-8 shadow-2xl transition-all duration-300 ease-in-out
								${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}
							`}
                >
                    <a href="#home" className={getLinkClasses("home")} onClick={closeMobileMenu}>
                        {t("landing.nav.home")}
                    </a>
                    <a href="#plans" className={getLinkClasses("plans")} onClick={closeMobileMenu}>
                        {t("landing.nav.plans")}
                    </a>
                    <a href="#contact" className={getLinkClasses("contact")} onClick={closeMobileMenu}>
                        {t("landing.nav.contact")}
                    </a>
                </div>
            </header>

            {/* Application Main Content Sections */}
            <section id="home" className="min-h-screen flex items-center justify-center bg-primary-50">
                <HeroComponent />
            </section>

            <section id="plans" className="min-h-screen flex items-center justify-center bg-primary-300">
                <PlansComponent />
            </section>

            <section id="contact" className="min-h-screen flex items-center justify-center bg-primary-50">
                <ContactComponent />
            </section>

            <section id="footer">
                <FooterComponent />
            </section>

            {/* Floating Global Language Picker */}
            <LanguagePickerComponent
                btnBgColour={langBtnBgColour}
                btnTextColour={langBtnTextColour}
                langSection={langSection}
            />
        </div>
    );
};
