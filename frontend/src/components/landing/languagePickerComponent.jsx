/** React & Third-Party Libraries */
import { useState, useRef, useEffect } from "react";

/** Assets & Icons */
import { IconWorld } from "@tabler/icons-react";

/** Language */
import { useTranslation } from "react-i18next";

export const LanguagePickerComponent = ({ btnBgColour, btnTextColour, langSection }) => {
    const { i18n } = useTranslation();

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef(null);

    /**
     * Outside Click Detector Engine
     *
     * Effect hook to handle clicks outside the respective dropdown components to close them.
     */
    useEffect(() => {
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
     * Helper function to define language option classes dynamically.
     * Ensures contrast against the dynamically changing dropdown background.
     *
     * @function
     * @param {string} lang - The language code (e.g., "es", "en").
     * @returns {string} Tailwind CSS class string.
     */
    const getLangOptionClasses = (lang) => {
        const isSelected = i18n.language === lang;
        const isLightBg = langSection === "plans" || langSection === "footer";

        let baseClasses = "p-2 text-sm font-semibold text-center rounded-xl transition-colors duration-200 ";

        if (isLightBg) {
            // 🟢 CLASES PARA FONDO CLARO (Planes y Footer)
            return (
                baseClasses +
                (isSelected
                    ? "bg-primary-100 text-primary-600"
                    : "text-primary-400 hover:bg-primary-100/50 hover:text-primary-600")
            );
        } else {
            // 🟢 CLASES PARA FONDO OSCURO (Inicio y Contacto)
            return (
                baseClasses +
                (isSelected
                    ? "bg-primary-50 text-primary-500"
                    : "text-primary-50 hover:bg-primary-400/50 hover:text-white")
            );
        }
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div ref={langMenuRef} className="fixed bottom-6 left-6 z-50">
            {/* El menú desplegable (Se despliega hacia arriba) */}
            <div
                className={`absolute bottom-full left-0 w-full ${btnBgColour} rounded-t-2xl overflow-hidden origin-bottom
                    ${isLangMenuOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-2 pointer-events-none"}`}
            >
                <div className="flex flex-col p-2 gap-1">
                    <button
                        onClick={() => {
                            changeLanguage("es");
                            setIsLangMenuOpen(false);
                        }}
                        className={getLangOptionClasses("es")}
                    >
                        Español
                    </button>
                    <button
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

            {/* El Botón Flotante (Globo) */}
            <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center justify-center w-fit gap-2 py-3 px-4 shadow-lg
                    ${isLangMenuOpen ? "rounded-b-3xl rounded-t-none" : "rounded-full"}
                    ${btnBgColour} ${btnTextColour}`}
                aria-label="Cambiar idioma"
            >
                <IconWorld className="w-6 h-6" />
                <span className="text-sm font-bold uppercase mr-1">{i18n.language}</span>
            </button>
        </div>
    );
};
