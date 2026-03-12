/** React & Third-Party Libraries */
import { Link } from "react-router-dom"

/** Assets & Icons */
import { IconChevronLeft } from '@tabler/icons-react';

/**
 * Payment Selection Page
 *
 * This component renders a standalone page where users can select their
 * preferred billing cycle (Monthly, Quarterly, or Annual). It features a
 * responsive grid layout with pricing cards.
 *
 * @component
 * @returns {JSX.Element} The full-screen payment selection interface.
 */
export const PaymentPage = () => {
    /**
     * Color Theme Configuration
     * 
     * This object maps abstract theme keys to concrete Tailwind utility classes.
     * 
     * @constant {Object}
     */
    const coloursVariants = {
        tertiaryLight: {
            text: "text-tertiary-300",
            bg: "bg-tertiary-300",
        },
        tertiaryMedium: {
            text: "text-tertiary-500",
            bg: "bg-tertiary-500",
        },
        tertiaryDark: {
            text: "text-tertiary-700",
            bg: "bg-tertiary-700",
        },
    };

    /**
     * Pricing Options Data
     * 
     * Defines the content and visual style for each billing cycle card.
     * 
     * @type {Array<Object>}
     */
    const pricingOptions = [
        {
            colour: "tertiaryDark",
            title: "Pago mensual",
            price: "10 €/mes",
            discount: "",
            desc: "Mantén el control absoluto de tus gastos con nuestra opción más libre. Ideal si estás empezando, gestionas proyectos temporales o simplemente prefieres evaluar el impacto de la herramienta mes a mes. Sin contratos de permanencia: tienes la libertad de cancelar o cambiar tu plan cuando lo necesites.",
            textButton: "Seleccionar mensual"
        },
        {
            colour: "tertiaryMedium",
            title: "Pago trimestral",
            price: "25 €/trimestre",
            discount: "- 17%",
            desc: "El punto medio perfecto entre agilidad y compromiso. Alinea tus pagos con tus objetivos trimestrales y reduce la carga administrativa de las facturas mensuales, todo mientras disfrutas de un descuento exclusivo por tu confianza a medio plazo.",
            textButton: "Seleccionar trimestral"
        },
        {
            colour: "tertiaryLight",
            title: "Pago anual",
            price: "80 €/año",
            discount: "- 33%",
            desc: "La decisión financiera más inteligente para equipos consolidados. Realiza un único pago, olvídate de renovaciones administrativas durante 12 meses completos y maximiza tu retorno de inversión aprovechando nuestro mayor descuento disponible.",
            textButton: "Seleccionar anual"
        }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-300">
            <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center gap-16 p-12 md:p-8 mt-28 md:mt-0">
                {/* Fixed Header */}
                <header className="fixed z-50 top-0 right-0 left-0 bg-primary-300 bg-opacity-80 backdrop-blur-md transition-all duration-500 ease-in-out">
                    <div className="w-full mx-auto flex items-center justify-between p-8">
                        {/* Brand Logo */}
                        <Link to="/">
                            <img className="h-10 w-auto cursor-pointer" src="/public/logoHeader_2.svg" alt="Logo Tikal"/>
                        </Link>
            
                        {/* Navigation */}
                        <Link to="/#plans">
                            <nav className="h-10 flex items-center gap-2 bg-primary-50 font-semibold p-2 rounded-full shadow-md">
                                {/* Navigation links with conditional class rendering */}
                                <IconChevronLeft className="h-6 w-6 text-primary-300 cursor-pointer" />
                            </nav>
                        </Link>
                    </div>
                </header>

                <div className="text-primary text-center">
                    {/* Hero Section */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Elige tu forma de pago
                    </h1>

                    {/* Description Section */}
                    <p className="text-xl mb-10">
                        Selecciona la frecuencia de facturación que mejor se adapte a tu flujo de trabajo y presupuesto.
                    </p>

                    {/* Pricing Options */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {pricingOptions.map((option, index) => {
                            const styles = coloursVariants[option.colour];

                            return (
                                <div key={index} className="h-full flex flex-col justify-between bg-primary p-6 rounded-xl shadow-lg">
                                    {/* Card Content Top (Title, Price, Desc) */}
                                    <div className="flex flex-col md:text-left gap-4 text-quaternary-700 mb-6">
                                        <span className="text-3xl font-light">
                                            {option.title}
                                        </span>

                                        {option.discount == ""? (
                                            <div className="flex items-center justify-center md:justify-start">
                                                <span className={`${styles.text} text-2xl font-light`}>
                                                    {option.price}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className={`${styles.text} text-2xl font-light`}>
                                                    {option.price}
                                                </span>

                                                <span className={`${styles.text} text-xl font-light`}>
                                                    {option.discount}
                                                </span>
                                            </div>
                                        )}

                                        <p className="font-extralight">
                                            {option.desc}
                                        </p>
                                    </div>

                                    {/* Call-to-Action Button */}
                                    <Link to="/register" state={{ plan: 'COMUNITARIO' }} className={`btn ${styles.bg} text-primary`}>
                                        {option.textButton}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};