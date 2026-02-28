import { Link } from "react-router-dom";
import { FormRegisterComponent } from "../../components/auth/FormRegisterComponent.jsx";

/**
 * Registration Page Layout
 *
 * This component serves as the dedicated entry point for new user onboarding.
 * It implements a focused, distraction-free layout designed to maximize
 * conversion rates. It acts as a structural wrapper, responsible for the visual
 * presentation while delegating the input logic and validation to the
 * `FormRegisterComponent`.
 *
 * @component
 * @returns {JSX.Element} The rendered registration page layout.
 */
export const RegisterPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-0 md:p-4">

            {/* Registration Card Container */}
            <div className="min-h-screen md:min-h-fit w-full max-w-md flex flex-col bg-primary-50 p-6 md:p-10 md:rounded-xl md:shadow-2xl">

                {/* Header Section: Branding & Title */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="text-primary-300 font-semibold cursor-pointer transition-colors duration-300">
                        <img className="h-10 w-auto" src="/public/logoHeader_1.svg" alt="Logo Tikal" />
                    </Link>

                    <h1 className="text-primary-300 text-3xl text-center font-bold">Crear Cuenta</h1>
                </div>

                <div className="flex flex-1 flex-col justify-center">
                    {/* Registration Form */}
                    <FormRegisterComponent  />

                    {/* Footer Section: Link to Login */}
                    <div className="text-center mt-8 space-y-2">
                        <p className="text-quaternary-700 text-sm">
                            ¿Ya eres miembro de Tikal? <Link to="/login" className="text-primary-600 font-semibold transition-colors hover:text-primary-700">Inicia Sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
