/** React & Third-Party Libraries */
import { Link } from "react-router-dom"

/** Assets & Icons */
import { UserIcon } from "../../assets/icons/userIcon.jsx"
import { GroupIcon } from "../../assets/icons/groupIcon.jsx"
import { CheckIcon } from "../../assets/icons/checkIcon.jsx"
import { XIcon } from "../../assets/icons/xIcon.jsx"

/**
 * Plans & Pricing Section Component
 *
 * This component renders the subscription plans section of the landing page. It
 * outlines the different tiers available, presenting a clear comparison of their
 * respective features.
 *
 * @component
 * @returns {JSX.Element} The rendered plans section with a responsive grid
 * layout.
 */
export const PlansComponent = () => {

    /**
     * Color Theme Configuration
     * 
     * This object maps abstract theme keys to concrete Tailwind utility classes.
     */
    const coloursVariants = {
        secondary: {
            text: "text-secondary-800",
            bg: "bg-secondary-800",
        },
        tertiary: {
            text: "text-tertiary-400",
            bg: "bg-tertiary-400",
        },
    };

    /**
     * Icon Component Map
     *
     * Acts as a lookup table to resolve string identifiers from the data into
     * actual React functional components.
     */
    const iconMap = {
        "UserIcon": UserIcon,
        "GroupIcon": GroupIcon
    };

    /**
     * Pricing Options Data
     *
     * Defines the content and visual style for each subscription plan.
     */
    const plansOptions = [
        {
            colour: "secondary",
            icon: "UserIcon",
            tagText: "Guerrero Solitario",
            title: "Plan individual",
            price: "",
            desc: "Todo lo esencial para gestionar tus tareas, trackear tu tiempo y entrar en zona de concentración sin coste.",
            featuresList: [
                { text: "Proyectos personales ilimitados", included: true },
                { text: "Time tracker personal", included: true },
                { text: "Modo templo", included: true },
                { text: "Dashboard de equipo", included: false },
                { text: "Chat", included: false },
                { text: "Reportes PDF & Excel", included: false }
            ],
            textButton: "Comenzar Gratis",
            action: "/register",
            state: { plan: 'GRATUITO' }
        },
        {
            colour: "tertiary",
            icon: "GroupIcon",
            tagText: "Constructor de Ciudades",
            title: "Plan cooperativo",
            price: "10 €/mes",
            desc: "Desbloquea el trabajo colaborativo, reportes avanzados y gestión de roles para llevar tu negocio al siguiente nivel.",
            featuresList: [
                { text: "Proyectos personales ilimitados", included: true },
                { text: "Time tracker personal", included: true },
                { text: "Modo templo", included: true },
                { text: "Dashboard de equipo", included: true },
                { text: "Chat", included: true },
                { text: "Reportes PDF & Excel", included: true }
            ],
            textButton: "Prueba Premium",
            action: "/payment"
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center p-12 md:p-8 mt-28 md:m-28">
            <div className="text-primary text-center">
                {/* Hero Section */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    Escala tu Productividad
                </h1>

                {/* Description Section */}
                <p className="text-xl mb-10">
                    Al igual que Tikal no se construyó en un día, tu productividad necesita cimientos sólidos.
                    <br />
                    Elige la estructura que tu proyecto demanda hoy.
                </p>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {plansOptions.map((plan, index) => {
                        const styles = coloursVariants[plan.colour];
                        const IconComponent = iconMap[plan.icon];

                        return (
                            <div key={index} className="bg-primary p-6 rounded-xl shadow-lg">
                                {/* Card Header */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                                    <IconComponent className={`w-10 h-10 ${styles.text}`} />

                                    <div className={`${styles.bg} text-xl font-passero font-semibold px-4 py-2 rounded-full`}>
                                        {plan.tagText}
                                    </div>
                                </div>

                                {/* Plan Details */}
                                <div className="flex flex-col lg:text-left gap-4 text-quaternary-700 mb-6">
                                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
                                        <span className="text-3xl font-light">
                                            {plan.title}
                                        </span>

                                        <span className="text-2xl font-light">
                                            {plan.price}
                                        </span>
                                    </div>

                                    <p className="font-extralight">
                                        {plan.desc}
                                    </p>
                                </div>

                                {/* Features List */}
                                <div className="flex flex-col text-left gap-4 text-quaternary-700 mb-8">
                                    {plan.featuresList.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            {feature.included ? (<CheckIcon className="w-5 h-5" />) : (<XIcon className="w-5 h-5" />)}
                                            
                                            <p className={`font-thin
                                                           ${feature.included ? "text-gray-700" : "text-gray-400 line-through decoration-gray-300"}
                                                         `}
                                            >
                                                {feature.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Call-to-Action Button */}
                                <Link to={plan.action} state={plan.state} className={`btn md:w-1/2 ${styles.bg} text-primary`}>
                                    {plan.textButton}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Note */}
                <p className="font-thin">
                    ¿Necesitas ambas? No hay problema. El plan Constructor incluye tu espacio personal privado sin coste adicional.
                </p>
            </div>
        </div>
    );
};