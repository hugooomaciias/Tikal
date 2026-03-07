/** React & Third-Party Libraries */
import { Link } from "react-router-dom"

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
    return (
        <footer className="w-full bg-primary-300 text-primary-50 py-12 px-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Brand & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <a href="#home">
						<img className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" src="/public/logoHeader_2.svg" alt="Logo Tikal" />
					</a>
                    <p className="text-sm font-medium opacity-80">
                        © {new Date().getFullYear()} Tikal. Todos los derechos reservados.
                    </p>
                </div>

                {/* Footer Links */}
                <div className="flex gap-6 text-sm font-semibold">
                    <Link to="/privacy" className="hover:text-white transition-colors">
                        Política de Privacidad
                    </Link>
                    <Link to="/terms" className="hover:text-white transition-colors">
                        Términos de Servicio
                    </Link>
                </div>
            </div>
        </footer>
    );
};
