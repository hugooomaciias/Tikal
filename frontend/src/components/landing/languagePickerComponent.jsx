/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Icons */
import { IconWorld } from "@tabler/icons-react";

/**
 * Language Picker Component
 *
 * A hybrid presentational floating widget that allows users to toggle the application's
 * current locale. It manages minimal local state exclusively for UI interactions (dropdown
 * visibility toggling) and dynamically adapts its styling based on the section of the
 * landing page where it is accessed.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.btnBgColour - Tailwind classes for the button background.
 * @param {string} props.btnTextColour - Tailwind classes for the button text color.
 * @param {string} props.langSection - Identifier for the current section (e.g., "plans", "footer").
 * @returns {JSX.Element} The floating language selection widget.
 */
export const LanguagePickerComponent = ({ btnBgColour, btnTextColour, langSection }) => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook Extraction
     *
     * Provides access to the internationalization engine to configure the locale.
     */
    const { i18n } = useTranslation();

    /**
     * Click Outside DOM Reference
     *
     * Captures the DOM element of the widget to detect external clicks.
     */
    const langMenuRef = useRef(null);

    /**
     * Menu Visibility State
     *
     * Controls the open/closed state of the language selection dropdown.
     */
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    /**
     * Outside Click Detector Effect
     *
     * Registers a global mousedown listener to automatically close the
     * language menu when the user clicks outside its container.
     */
    useEffect(() => {
        /**
         * Outside Click Handler
         *
         * Evaluates if a click occurred outside the component boundary and closes the menu if true.
         *
         * @param {MouseEvent} event - The triggered global mouse event.
         * @returns {void}
         */
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setIsLangMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /**
     * Language Option Class Generator
     *
     * Computes dynamic Tailwind CSS classes for the language options, ensuring
     * correct contrast against the varying dropdown backgrounds.
     *
     * @param {string} lang - The language code (e.g., "es", "en").
     * @returns {string} The computed Tailwind CSS class string.
     */
    const getLangOptionClasses = (lang) => {
        const isSelected = i18n.language === lang;
        const isLightBg = langSection === "plans" || langSection === "footer";

        let baseClasses = "p-2 text-sm font-semibold text-center rounded-xl transition-colors duration-200 ";

        if (isLightBg) {
            return (
                baseClasses +
                (isSelected
                    ? "bg-primary-100 text-primary-600"
                    : "text-primary-400 hover:bg-primary-100/50 hover:text-primary-600")
            );
        } else {
            return (
                baseClasses +
                (isSelected
                    ? "bg-primary-50 text-primary-500"
                    : "text-primary-50 hover:bg-primary-400/50 hover:text-white")
            );
        }
    };

    /**
     * Language Change Handler
     *
     * Instructs the i18n engine to switch the current locale context.
     *
     * @param {string} lang - The new language code to apply safely context-wide.
     * @returns {void}
     */
    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    // --- 2. Render ---

    return (
        <div ref={langMenuRef} className="fixed bottom-6 left-6 z-50">
            {/* Expanding Dropdown Menu Options (Upwards Animation) */}
            <div
                className={`absolute bottom-full left-0 w-full ${btnBgColour} rounded-t-2xl overflow-hidden origin-bottom
                    ${isLangMenuOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2 pointer-events-none"}`}
            >
                {/* Options List Column */}
                <div className="flex flex-col p-2 gap-1">
                    {/* Spanish Selection Option */}
                    <button
                        type="button"
                        onClick={() => {
                            changeLanguage("es");
                            setIsLangMenuOpen(false);
                        }}
                        className={getLangOptionClasses("es")}
                    >
                        Español
                    </button>

                    {/* English Selection Option */}
                    <button
                        type="button"
                        onClick={() => {
                            changeLanguage("en");
                            setIsLangMenuOpen(false);
                        }}
                        className={getLangOptionClasses("en")}
                    >
                        English
                    </button>
                </div>
            </div>

            {/* Main Floating Action Toggle Button */}
            <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center justify-center w-fit gap-2 py-3 px-4 shadow-lg
                    ${isLangMenuOpen ? "rounded-b-3xl rounded-t-none" : "rounded-full"}
                    ${btnBgColour} ${btnTextColour}`}
                aria-label="Cambiar idioma"
            >
                {/* World Icon Indiciator */}
                <IconWorld className="w-6 h-6" />

                {/* Current Active Language Text */}
                <span className="text-sm font-bold uppercase mr-1">{i18n.language}</span>
            </button>
        </div>
    );
};
