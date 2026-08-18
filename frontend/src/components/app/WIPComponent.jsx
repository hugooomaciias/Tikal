/** React & Third-Party Libraries */
import { useNavigate } from "react-router-dom";

/** Icons */
import { IconHammer, IconArrowLeft } from "@tabler/icons-react";

/**
 * Work In Progress Component
 *
 * A visually appealing "Under Construction" page that matches the application's
 * mystical aesthetic. It provides clear feedback to the user that the feature 
 * is currently being developed and offers an easy way to navigate back.
 *
 * @component
 * @returns {JSX.Element} The rendered Work In Progress page.
 */
export const WIPComponent = () => {
    // --- 1. Hooks ---
    const navigate = useNavigate();

    // --- 2. Handlers ---
    const handleGoBack = () => {
        navigate(-1); 
    };

    // --- 3. Render ---
    return (
        <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 bg-primary-900 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-700/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full bg-primary-800/60 border border-primary-700/50 backdrop-blur-md shadow-2xl p-10 md:p-14 rounded-[3rem] animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                <div className="relative w-24 h-24 mb-8 rounded-full bg-primary-700/50 border border-primary-600/30 flex items-center justify-center shadow-inner">
                    <IconHammer className="w-12 h-12 text-primary-100 animate-pulse" stroke={1.5} />
                </div>

                <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-wide font-passero">
                    En Construcción
                </h1>
                
                <p className="text-primary-200/80 text-lg mb-10 leading-relaxed max-w-sm mx-auto">
                    Nuestros artesanos están esculpiendo esta nueva zona del templo. ¡La sabiduría que buscas estará disponible muy pronto!
                </p>

                <button
                    type="button"
                    onClick={handleGoBack}
                    className="group flex items-center gap-3 bg-primary-600/80 hover:bg-primary-500 border border-primary-500/50 text-white px-8 py-3.5 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--tw-colors-primary-500),0.4)] active:scale-95"
                >
                    <IconArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" stroke={2} />
                    <span>Volver al camino</span>
                </button>

            </div>
        </div>
    );
};