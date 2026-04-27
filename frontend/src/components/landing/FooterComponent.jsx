/** React & Third-Party Libraries */
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Assets, Utils & Constants */
import logoFooter from "../../assets/tikal/logoHeader_2.svg";

/**
 * Footer Component
 *
 * This component renders the footer of the landing page, displaying
 * the branding logo, copyright information, and essential legal links.
 *
 * @component
 * @returns {JSX.Element} The rendered Footer section.
 */
export const FooterComponent = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * landing page namespace.
     */
    const { t } = useTranslation("landing");

    // --- 3. Derived Variables ---

    /**
     * Current Year
     *
     * Computes the current year dynamically for the copyright notice.
     */
    const currentYear = new Date().getFullYear();

    // --- 6. Render ---

    return (
        <footer className="w-full bg-primary-300 text-primary-50 py-12 px-8 flex flex-col items-center justify-center">
            {/* Footer Content Container */}
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Brand & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <a href="#home">
                        <img
                            className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                            src={logoFooter}
                            alt="Logo Tikal"
                        />
                    </a>
                    <p className="text-sm font-medium opacity-80">
                        © {currentYear} Tikal. {t("landing.footer.copyright")}
                    </p>
                </div>

                {/* Footer Links */}
                <div className="flex gap-6 text-sm font-semibold">
                    <Link to="/privacy" className="hover:text-white transition-colors">
                        {t("landing.footer.privacy")}
                    </Link>
                    <Link to="/terms" className="hover:text-white transition-colors">
                        {t("landing.footer.terms")}
                    </Link>
                </div>
            </div>
        </footer>
    );
};
