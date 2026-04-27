/** React & Third-Party Libraries */
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Icons */
import { IconUser, IconUsersGroup, IconCheck, IconX } from "@tabler/icons-react";

/**
 * Plans & Pricing Section Component
 *
 * This component renders the subscription plans section of the landing page. It
 * outlines the different tiers available, presenting a clear comparison of their
 * respective features.
 *
 * @component
 * @returns {JSX.Element} The rendered plans section with a responsive grid layout.
 */
export const PlansComponent = () => {
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
        UserIcon: IconUser,
        GroupIcon: IconUsersGroup,
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

    // --- 6. Render ---

    return (
        <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center p-12 md:p-8 mt-28 md:m-28">
            <div className="text-primary text-center">
                {/* Hero Section */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{t("landing.plans.title")}</h1>

                {/* Description Section */}
                <p className="md:w-3/4 mx-auto text-xl mb-10">{t("landing.plans.description")}</p>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {plansOptions.map((plan, planIndex) => {
                        const styles = coloursVariants[plan.colour];
                        const IconComponent = iconMap[plan.icon];

                        return (
                            <div key={planIndex} className="bg-primary p-6 rounded-xl shadow-lg">
                                {/* Card Header */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                                    <IconComponent className={`w-10 h-10 ${styles.text}`} />

                                    <div
                                        className={`${styles.bg} text-xl font-passero font-semibold px-4 py-2 rounded-full`}
                                    >
                                        {plan.tagText}
                                    </div>
                                </div>

                                {/* Plan Details */}
                                <div className="flex flex-col lg:text-left gap-4 text-quaternary-700 mb-6">
                                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
                                        <span className="text-3xl font-light">{plan.title}</span>

                                        <span className="text-2xl font-light">{plan.price}</span>
                                    </div>

                                    <p className="font-extralight">{plan.desc}</p>
                                </div>

                                {/* Features List */}
                                <div className="flex flex-col text-left gap-4 text-quaternary-700 mb-8">
                                    {plan.featuresList.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-4">
                                            {feature.included ? (
                                                <IconCheck className="w-5 h-5" />
                                            ) : (
                                                <IconX className="w-5 h-5" />
                                            )}

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

                                {/* Call-to-Action Button */}
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

                {/* Footer Note */}
                <p className="font-thin">{t("landing.plans.footer_note")}</p>
            </div>
        </div>
    );
};
