/** Components */
import { FormContactComponent } from "./FormContactComponent.jsx";

/** Language */
import { useTranslation, Trans } from "react-i18next";

/**
 * Contact Support Section Layout
 *
 * This component serves as the structural wrapper for the Contact section.
 * It implements a responsive split-view layout that combines the brand's
 * customer service philosophy with the functional input mechanism.
 *
 * @component
 * @returns {JSX.Element} The visual layout of the contact section.
 */
export const ContactComponent = () => {
    /**
     * Translation Hook
     *
     * Provides the 't' function to localize strings specifically for the
     * landing page namespace.
     */
    const { t } = useTranslation("landing");

    return (
        <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center p-12 md:p-8 mt-28 md:m-28">
            <div className="text-primary-300 text-center">
                {/* Section Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-10 leading-tight">
                    {t("landing.contact.title")}
                </h1>

                {/* Split Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
                    {/* Left Column - Brand Messaging Description */}
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

                    {/* Right Column - Contact Form Container */}
                    <div className="bg-primary-300 p-8 rounded-xl shadow-lg">
                        <FormContactComponent t={t} />
                    </div>
                </div>
            </div>
        </div>
    );
};
