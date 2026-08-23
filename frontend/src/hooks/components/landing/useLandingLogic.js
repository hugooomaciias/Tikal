/** React & Third-Party Libraries */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Landing Page Logic Hook
 *
 * Headless hook that abstracts the scroll spy logic, deep-linking navigation,
 * mobile menu toggling, and dynamic theme calculation for the Landing Page.
 * By extracting these behaviors, the UI component remains purely declarative.
 *
 * @function
 * @returns {Object} Structured payload containing localization ('t'), UI states,
 *                   memoized theme configurations, and interaction handlers.
 */
export const useLandingLogic = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * landing namespace.
     */
    const { t } = useTranslation("landing");

    /**
     * Location Hook
     *
     * Accesses the current URL hash to handle deep linking.
     */
    const { hash } = useLocation();

    // --- 2. Local UI State ---

    /**
     * Active Section State
     *
     * Tracks the ID of the section currently visible in the viewport.
     * Drives the conditional styling of the navbar and logo.
     * @type {[string, Function]}
     */
    const [activeSection, setActiveSection] = useState("home");

    /**
     * Language Section State
     *
     * Tracks the current section bounding rect to conditionally style the floating
     * language picker button.
     * @type {[string, Function]}
     */
    const [langSection, setLangSection] = useState("home");

    /**
     * Mobile Menu Toggle State
     *
     * Tracks the mobile navigation menu visibility.
     * True indicates the dropdown is open, False indicates it's closed.
     * @type {[boolean, Function]}
     */
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    /**
     * Window Scroll State
     *
     * Tracks if the page has been scrolled from the top.
     * Used to conditionally apply a shadow to the navbar for better separation.
     * @type {[boolean, Function]}
     */
    const [isScrolled, setIsScrolled] = useState(false);

    // --- 3. Derived UI Data ---

    /**
     * Landing Theme Configuration
     *
     * Memoized to prevent recalculating the color map object and re-evaluating
     * the static configuration during every scroll or re-render. Extracts the
     * specific CSS background, logo, and text color configurations based on
     * the currently active viewport section and language button section.
     *
     * @type {Object} The compiled theme object.
     */
    const landingTheme = useMemo(() => {
        const section_config = {
            home: {
                bg: "bg-primary-50",
                logo: "/tikal/logoHeader_1.svg",
                navbarBg: "bg-primary-300",
                mobileText: "text-primary",
                langBtnBg: "bg-primary-300",
                langBtnText: "text-primary",
            },
            plans: {
                bg: "bg-primary-300",
                logo: "/tikal/logoHeader_2.svg",
                navbarBg: "bg-primary-50",
                mobileText: "text-primary-300",
                langBtnBg: "bg-primary-50",
                langBtnText: "text-primary-300",
            },
            contact: {
                bg: "bg-primary-50",
                logo: "/tikal/logoHeader_1.svg",
                navbarBg: "bg-primary-300",
                mobileText: "text-primary",
                langBtnBg: "bg-primary-300",
                langBtnText: "text-primary",
            },
            footer: {
                langBtnBg: "bg-primary-50",
                langBtnText: "text-primary-300",
            },
        };

        const activeTheme = section_config[activeSection] || section_config.home;
        const langTheme = section_config[langSection] || section_config.home;

        return {
            bgColour: activeTheme.bg,
            logoColour: activeTheme.logo,
            navbarBgColour: activeTheme.navbarBg,
            mobileTextColour: activeTheme.mobileText,
            langBtnBgColour: langTheme.langBtnBg,
            langBtnTextColour: langTheme.langBtnText,
        };
    }, [activeSection, langSection]);

    // --- 4. Side Effects ---

    /**
     * Hash Navigation Scroll Effect
     *
     * Detects if the user navigated here via a specific anchor. Performs a
     * smooth scroll to the target DOM element after the component mounts.
     */
    useEffect(() => {
        if (hash) {
            const id = hash.replace("#", "");
            const element = document.getElementById(id);

            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [hash]);

    /**
     * Scroll Spy Registration Effect
     *
     * Manages the window scroll event subscription. Calculates which section
     * is currently crossing the top threshold of the screen to synchronously
     * update the active UI states. Re-evaluates threshold if mobile menu toggles.
     */
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "plans", "contact", "footer"];
            let currentSection = "home";

            // Dynamic Threshold Calculation
            const threshold = isMobileMenuOpen ? 250 : 104;

            // Determine the active section based on scroll position
            for (const section of sections) {
                const element = document.getElementById(section);

                if (element && element.getBoundingClientRect().top <= threshold) {
                    currentSection = section;
                }
            }

            let currentLangSection = "home";
            const langBtnY = window.innerHeight - 50;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= langBtnY && rect.bottom >= langBtnY) {
                        currentLangSection = section;
                        break;
                    }
                }
            }

            let isAtSectionStart = false;
            if (currentSection !== "home") {
                const currentElement = document.getElementById(currentSection);

                if (currentElement) {
                    const rect = currentElement.getBoundingClientRect();
                    isAtSectionStart = rect.top < 104 && rect.top > -10;
                }
            }

            // Update the different states
            setActiveSection(currentSection);
            setLangSection(currentLangSection);
            setIsScrolled(window.scrollY > 0 && !isAtSectionStart);

            const newHash = currentSection === "home" ? " " : `#${currentSection}`;

            if (window.location.hash !== newHash.trim()) {
                window.history.replaceState(null, null, newHash === " " ? window.location.pathname : newHash);
            }
        };

        // Register event listener
        window.addEventListener("scroll", handleScroll);

        // Initial check
        handleScroll();

        // Cleanup
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMobileMenuOpen]);

    // --- 5. Interaction Handlers ---

    /**
     * Mobile Menu Toggle Handler
     *
     * Inverts the boolean state controlling the mobile dropdown navigation.
     * Memoized to retain reference stability when passed to child components.
     *
     * @returns {void}
     */
    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen((prev) => !prev);
    }, []);

    /**
     * Mobile Menu Close Handler
     *
     * Forcibly closes the mobile dropdown navigation. Commonly used when
     * clicking a link within the dropdown menu.
     * Memoized to retain reference stability when passed to child components.
     *
     * @returns {void}
     */
    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    /**
     * Active Link Stylizer
     *
     * Helper function to define navigation link classes dynamically.
     * Ensures visual consistency between active and inactive states based on
     * the scroll spy results.
     *
     * @param {string} sectionName - The ID of the target section.
     * @returns {string} Tailwind CSS class string.
     */
    const getLinkClasses = useCallback(
        (sectionName) => {
            const isActive = activeSection === sectionName;
            let classes = "transition-colors duration-300 font-semibold cursor-pointer ";

            if (activeSection === "plans") {
                return classes + (isActive ? "text-primary-300" : "text-primary-600");
            }

            return classes + (isActive ? "text-primary-50" : "text-primary-600");
        },
        [activeSection],
    );

    // --- 6. Return Object ---

    return {
        t,
        landingStates: { isMobileMenuOpen, isScrolled, langSection },
        landingTheme,
        landingActions: { toggleMobileMenu, closeMobileMenu, getLinkClasses },
    };
};
