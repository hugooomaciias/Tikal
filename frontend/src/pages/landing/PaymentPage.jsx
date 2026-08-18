/** React & Third-Party Libraries */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Components & Layouts */
import { LanguagePickerComponent } from "../../components/landing/languagePickerComponent.jsx";

/** Icons */
import { IconChevronLeft } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import logoHeader from "/tikal/logoHeader_2.svg";

/**
 * Payment Selection Page Component
 *
 * A primarily visual presentational layout rendering a standalone page where users can
 * select their preferred billing cycle. It manages minimal local data to map out the
 * different payment options within a responsive grid layout, and integrates global
 * language selection logic.
 *
 * @component
 * @returns {JSX.Element} The full-screen payment selection interface.
 */
export const PaymentPage = () => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook Extraction
     *
     * Provides the 't' function to localize static text strings specifically
     * for the payment page content.
     */
    const { t } = useTranslation();

    /**
     * Color Theme Configuration
     *
     * This object maps abstract theme keys to concrete Tailwind utility classes
     * used dynamically when mapping over the pricing cards.
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
     * Defines the localized content, translation keys, and visual style map for each
     * billing cycle card rendered in the selection grid.
     */
    const pricingOptions = [
        {
            colour: "tertiaryDark",
            title: t("landing.payment.monthly.title"),
            price: t("landing.payment.monthly.price"),
            discount: t("landing.payment.monthly.discount"),
            desc: t("landing.payment.monthly.description"),
            textButton: t("landing.payment.monthly.buttonText"),
        },
        {
            colour: "tertiaryMedium",
            title: t("landing.payment.quarterly.title"),
            price: t("landing.payment.quarterly.price"),
            discount: t("landing.payment.quarterly.discount"),
            desc: t("landing.payment.quarterly.description"),
            textButton: t("landing.payment.quarterly.buttonText"),
        },
        {
            colour: "tertiaryLight",
            title: t("landing.payment.annual.title"),
            price: t("landing.payment.annual.price"),
            discount: t("landing.payment.annual.discount"),
            desc: t("landing.payment.annual.description"),
            textButton: t("landing.payment.annual.buttonText"),
        },
    ];

    // --- 2. Render ---

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-300">
            <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center gap-16 p-12 md:p-8 mt-28 md:mt-0">
                {/* Fixed Navigation Header Bar */}
                <header className="fixed z-50 top-0 right-0 left-0 bg-primary-300 bg-opacity-80 backdrop-blur-md transition-all duration-500 ease-in-out">
                    <div className="w-full mx-auto flex items-center justify-between p-8">
                        {/* Brand Logo Home Link */}
                        <Link to="/">
                            <img className="h-10 w-auto cursor-pointer" src={logoHeader} alt="Logo Tikal" />
                        </Link>

                        {/* Back to Plans Navigation Wrapper */}
                        <Link to="/#plans">
                            <nav className="h-10 flex items-center gap-2 bg-primary-50 font-semibold p-2 rounded-full shadow-md">
                                <IconChevronLeft className="h-6 w-6 text-primary-300 cursor-pointer" />
                            </nav>
                        </Link>
                    </div>
                </header>

                {/* Text Content & Grid Layout Section */}
                <div className="text-primary text-center">
                    {/* Hero Title Block */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{t("landing.payment.title")}</h1>

                    {/* Subtitle Description Paragraph */}
                    <p className="text-xl mb-10">{t("landing.payment.description")}</p>

                    {/* Pricing Cards Mapping Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Iterative Card Rendering */}
                        {pricingOptions.map((option, index) => {
                            const styles = coloursVariants[option.colour];

                            return (
                                <div
                                    key={index}
                                    className="h-full flex flex-col justify-between bg-primary p-6 rounded-xl shadow-lg"
                                >
                                    {/* Card Header & Detail Content */}
                                    <div className="flex flex-col md:text-left gap-4 text-quaternary-700 mb-6">
                                        <span className="text-3xl font-light">{option.title}</span>

                                        {/* Conditional Discount Block */}
                                        {option.discount == "" ? (
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

                                        <p className="font-extralight">{option.desc}</p>
                                    </div>

                                    {/* Plan Registration Call-to-Action Link */}
                                    <Link
                                        to="/register"
                                        state={{ plan: "COMUNITARIO" }}
                                        className={`btn ${styles.bg} text-primary`}
                                    >
                                        {option.textButton}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Floating Global Language Picker Inclusion */}
                    <LanguagePickerComponent
                        btnBgColour="bg-primary-50"
                        btnTextColour="text-primary-300"
                        langSection="plans"
                    />
                </div>
            </div>
        </div>
    );
};
