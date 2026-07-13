/** React & Third-Party Libraries */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Icons */
import { IconUser, IconUsersGroup, IconCheck, IconX } from "@tabler/icons-react";

/**
 * Plans & Pricing Section Component
 *
 * A primarily visual presentational layout rendering the subscription plans section
 * of the landing page. It manages minimal local data to map out the different pricing tiers,
 * presenting a clear visual comparison of their respective features and guiding the user to registration.
 *
 * @component
 * @returns {JSX.Element} The rendered plans section with a responsive grid layout.
 */
export const PlansComponent = () => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook Extraction
     *
     * Provides the 't' function to localize static text strings specifically
     * for the landing page namespace.
     */
    const { t } = useTranslation("landing");

    /**
     * Color Theme Configuration
     *
     * This object maps abstract theme keys to concrete Tailwind utility classes
     * used dynamically when mapping over the plan objects.
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
     * Acts as a lookup table to resolve string identifiers from the data array
     * into actual React functional icon components.
     */
    const iconMap = {
        UserIcon: IconUser,
        GroupIcon: IconUsersGroup,
    };

    /**
     * Pricing Options Data
     *
     * Defines the content, feature lists, and visual style configurations for
     * each subscription plan tier.
     */
    const plansOptions = [
        {
            colour: "secondary",
            icon: "UserIcon",
            tagText: t("landing.plans.free_plan.tag"),
            title: t("landing.plans.free_plan.title"),
            price: "",
            desc: t("landing.plans.free_plan.description"),
            featuresList: [
                { text: t("landing.plans.free_plan.features.personal_projects"), included: true },
                { text: t("landing.plans.free_plan.features.time_tracker"), included: true },
                { text: t("landing.plans.free_plan.features.temple_mode"), included: true },
                { text: t("landing.plans.free_plan.features.team_dashboard"), included: false },
                { text: t("landing.plans.free_plan.features.chat"), included: false },
                { text: t("landing.plans.free_plan.features.reports"), included: false },
            ],
            textButton: t("landing.plans.free_plan.button"),
            action: "/register",
            state: { plan: "GRATUITO" },
        },
        {
            colour: "tertiary",
            icon: "GroupIcon",
            tagText: t("landing.plans.premium_plan.tag"),
            title: t("landing.plans.premium_plan.title"),
            price: t("landing.plans.premium_plan.price"),
            desc: t("landing.plans.premium_plan.description"),
            featuresList: [
                { text: t("landing.plans.premium_plan.features.personal_projects"), included: true },
                { text: t("landing.plans.premium_plan.features.time_tracker"), included: true },
                { text: t("landing.plans.premium_plan.features.temple_mode"), included: true },
                { text: t("landing.plans.premium_plan.features.team_dashboard"), included: true },
                { text: t("landing.plans.premium_plan.features.chat"), included: true },
                { text: t("landing.plans.premium_plan.features.reports"), included: true },
            ],
            textButton: t("landing.plans.premium_plan.button"),
            action: "/payment",
        },
    ];

    // --- 2. Render ---

    return (
        <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center p-12 md:p-8 mt-28 md:m-28">
            {/* Main Content Container */}
            <div className="text-primary text-center">
                {/* Hero Title Block */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{t("landing.plans.title")}</h1>

                {/* Section Description Paragraph */}
                <p className="md:w-3/4 mx-auto text-xl mb-10">{t("landing.plans.description")}</p>

                {/* Pricing Cards Mapping Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Iterative Card Rendering */}
                    {plansOptions.map((plan, planIndex) => {
                        const styles = coloursVariants[plan.colour];
                        const IconComponent = iconMap[plan.icon];

                        return (
                            <div key={planIndex} className="bg-primary p-6 rounded-xl shadow-lg">
                                {/* Card Header Area: Icon & Theme Tag */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                                    <IconComponent className={`w-10 h-10 ${styles.text}`} />

                                    <div
                                        className={`${styles.bg} text-xl font-passero font-semibold px-4 py-2 rounded-full`}
                                    >
                                        {plan.tagText}
                                    </div>
                                </div>

                                {/* Plan Title, Price & Short Description */}
                                <div className="flex flex-col lg:text-left gap-4 text-quaternary-700 mb-6">
                                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
                                        <span className="text-3xl font-light">{plan.title}</span>

                                        <span className="text-2xl font-light">{plan.price}</span>
                                    </div>

                                    <p className="font-extralight">{plan.desc}</p>
                                </div>

                                {/* Features Checklist Block */}
                                <div className="flex flex-col text-left gap-4 text-quaternary-700 mb-8">
                                    {/* Iterative Feature Rendering */}
                                    {plan.featuresList.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-4">
                                            {/* Feature Status Icon */}
                                            {feature.included ? (
                                                <IconCheck className="w-5 h-5" />
                                            ) : (
                                                <IconX className="w-5 h-5" />
                                            )}

                                            {/* Feature Description Text */}
                                            <p
                                                className={`font-thin
                                                           ${feature.included ? "text-gray-700" : "text-gray-400 line-through decoration-gray-300"}
                                                         `}
                                            >
                                                {feature.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Registration Call-to-Action Link */}
                                <Link
                                    to={plan.action}
                                    state={plan.state}
                                    className={`btn md:w-1/2 ${styles.bg} text-primary`}
                                >
                                    {plan.textButton}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Disclamers & Footer Note */}
                <p className="font-thin">{t("landing.plans.footer_note")}</p>
            </div>
        </div>
    );
};
