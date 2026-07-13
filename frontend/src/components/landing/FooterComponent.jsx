/** React & Third-Party Libraries */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Assets, Utils & Constants */
import logoFooter from "../../assets/tikal/logoHeader_2.svg";

/**
 * Landing Footer Component
 *
 * A primarily visual presentational layout rendering the footer of the landing page.
 * It manages minimal local logic exclusively to dynamically generate the current year
 * and extract localization context for rendering the branding logo, copyright
 * information, and essential legal navigation links.
 *
 * @component
 * @returns {JSX.Element} The rendered Footer section.
 */
export const FooterComponent = () => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook Extraction
     *
     * Provides the 't' function to localize static text strings specifically
     * for the landing page namespace.
     */
    const { t } = useTranslation("landing");

    /**
     * Dynamic Copyright Year
     *
     * Computes the current year dynamically to ensure the copyright notice
     * remains perpetually up to date without manual intervention.
     */
    const currentYear = new Date().getFullYear();

    // --- 2. Render ---

    return (
        <footer className="w-full bg-primary-300 text-primary-50 py-12 px-8 flex flex-col items-center justify-center">
            {/* Footer Content Flex Wrapper */}
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left Column: Brand Identity & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    {/* Brand Logo Anchor */}
                    <a href="#home">
                        <img
                            className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                            src={logoFooter}
                            alt="Logo Tikal"
                        />
                    </a>

                    {/* Copyright Text Block */}
                    <p className="text-sm font-medium opacity-80">
                        © {currentYear} Tikal. {t("landing.footer.copyright")}
                    </p>
                </div>

                {/* Right Column: Legal Navigation Links */}
                <div className="flex gap-6 text-sm font-semibold">
                    {/* Privacy Policy Link */}
                    <Link to="/privacy" className="hover:text-white transition-colors">
                        {t("landing.footer.privacy")}
                    </Link>

                    {/* Terms of Service Link */}
                    <Link to="/terms" className="hover:text-white transition-colors">
                        {t("landing.footer.terms")}
                    </Link>
                </div>
            </div>
        </footer>
    );
};
