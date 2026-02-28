import { FormContactComponent } from "./FormContactComponent.jsx";

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
    return (
        <div className="w-full max-w-6xl mx-auto flex items-center justify-items-center p-12 md:p-8 mt-28 md:m-28">
            <div className="text-primary-300 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-10 leading-tight">
                    Estamos aqui para escucharte
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">

                    {/* Left Column - Brand Messaging */}
                    <div>
                        <p className="text-primary-300 text-lg md:text-xl text-justify font-medium">
                            En Tikal, creemos que la mejor herramienta es la que
                            <b className="text-primary-400"> evoluciona junto a
                            sus usuarios</b>. Nuestro compromiso es doble:
                            ofrecerte un<b className="text-primary-400"> soporte
                            técnico ágil y eficiente</b> para que ningún obstáculo
                            frene tu flujo de trabajo, y mantener un
                            <b className="text-primary-400"> canal abierto de
                            colaboración.</b>
                            
                            <br />
                            <br />

                            Ya sea para<b className="text-primary-400"> resolver
                            una incidencia urgente</b>, guiarte en el
                            uso de funciones avanzadas o
                            <b className="text-primary-400"> proponer esa
                            mejora</b> que cambiaría tu día a día, estamos al
                            otro lado preparados para escucharte. Tu feedback no solo es
                            bienvenido, es el plano sobre el que construimos el
                            <b className="text-primary-400"> futuro de esta plataforma.</b>
                        </p>
                    </div>

                    {/* Right Column - Contact Form */}
                    <div className="bg-primary-300 p-8 rounded-xl shadow-lg">
                        <FormContactComponent />
                    </div>
                </div>
            </div>
        </div>
    );
};