import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { TimeTracker } from "../widgets/TimeTracker.jsx";
import { Statistics } from "../widgets/Statistics.jsx";

/**
 * Hero Section Component (Home)
 *
 * This component renders the "above-the-fold" area of the landing page. It
 * serves as the primary entry point for user engagement, displaying the unique
 * value proposition, the brand identity with distinct visual styles, and the
 * main Call-to-Action (CTA) buttons. Additionally, it features a visual
 * composition of the application's widgets on larger screens to provide an
 * immediate preview of the product's interface.
 *
 * @component
 * @returns {JSX.Element} The rendered Hero section with a responsive grid layout
 */
export const HomeComponent = () => {
    const navigate = useNavigate();

    const handleAuthAccess = (destinationRoute) => {
        const hasAccessToken = localStorage.getItem('accessToken');
        const hasRefreshToken = localStorage.getItem('refreshToken');

        if (hasAccessToken && hasRefreshToken) {
            navigate('/loading');
        } else {
            navigate(destinationRoute);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-16 p-12 md:p-8 mt-28 md:mt-0">
            {/* Left Column - Brand Messaging & Actions */}
            <div>
                {/* Brand Title*/}
                <h1 className="font-bold mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-3xl text-transparent tracking-[0.3em]">
                        TIKAL
                    </span>

                    <br />
                    
                    <span className="text-quaternary-700 text-4xl opacity-90">
                        Domina el tiempo. Conquista tus proyectos
                    </span>
                </h1>

                {/* Hero Description */}
                <p className="md:max-w-md text-quaternary-700 text-xl mb-8">
                    Gestión inteligente para freelancers y equipos. Visualiza tu progreso, optimiza tus recursos y eleva tu productividad al siguiente nivel.
                </p>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4">
                    <button className="btn btn-primary" onClick={() => handleAuthAccess('/login')}>
                        Iniciar Sesión
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleAuthAccess('/register')}>
                        Comenzar gratis
                    </button>
                </div>
            </div>

            {/* Right Column - Product Visualization */}
            <div className="hidden md:flex items-center justify-center">
                {/* Primary Widget showcase */}
                <TimeTracker className="animate-float mb-40 w-1/2" />

                {/* Secondary Widget showcase */}
                <Statistics className="animate-float mt-40 w-1/2" />
            </div>
        </div>
    );
};