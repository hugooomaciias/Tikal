/** React & Third-Party Libraries */
import { Link } from "react-router-dom";

/** Language */
import { useTranslation } from "react-i18next";

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
    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * landing page namespace.
     */
    const { t } = useTranslation("landing");

    return (
        <footer className="w-full bg-primary-300 text-primary-50 py-12 px-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Brand & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <a href="#home">
                        <img
                            className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                            src="/public/logoHeader_2.svg"
                            alt="Logo Tikal"
                        />
                    </a>
                    <p className="text-sm font-medium opacity-80">
                        © {new Date().getFullYear()} Tikal. {t("landing.footer.copyright")}
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
