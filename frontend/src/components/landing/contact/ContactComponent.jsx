/** React & Third-Party Libraries */
import { useTranslation, Trans } from "react-i18next";

/** Components & Layouts */
import { FormContactComponent } from "./FormContactComponent.jsx";

/**
 * Contact Support Section Component
 *
 * A primarily visual presentational layout acting as the structural wrapper for the Contact
 * section on the landing page. It manages minimal logic exclusively to extract the translation
 * context and implements a responsive split-view layout combining the brand's customer service
 * philosophy with the functional contact form.
 *
 * @component
 * @returns {JSX.Element} The rendered visual layout of the contact section.
 */
export const ContactComponent = () => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook Extraction
     *
     * Provides the 't' function to localize static text strings specifically
     * for the landing page namespace.
     */
    const { t } = useTranslation("landing");

    // --- 2. Render ---

    return (
        <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center p-12 md:p-8 mt-28 md:m-28">
            {/* Contact Content Container */}
            <div className="text-primary-300 text-center">
                {/* Section Hero Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-10 leading-tight">
                    {t("landing.contact.title")}
                </h1>

                {/* Split Content Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
                    {/* Left Column: Brand Messaging Description */}
                    <div>
                        <p className="text-primary-300 text-lg md:text-xl text-justify font-medium">
                            <Trans
                                i18nKey="landing.contact.description1"
                                components={{ b: <b className="text-primary-400" /> }}
                            />
                            <br />
                            <br />
                            <Trans
                                i18nKey="landing.contact.description2"
                                components={{ b: <b className="text-primary-400" /> }}
                            />
                        </p>
                    </div>

                    {/* Right Column: Contact Form Container */}
                    <div className="bg-primary-300 p-8 rounded-xl shadow-lg">
                        <FormContactComponent t={t} />
                    </div>
                </div>
            </div>
        </div>
    );
};
