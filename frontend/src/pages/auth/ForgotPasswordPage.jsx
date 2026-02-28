import { Link } from "react-router-dom";
import { FormForgotPasswordComponent } from "../../components/auth/FormForgotPasswordComponent.jsx";

/**
 * Forgot Password Page Layout
 *
 * This component renders the dedicated view for the account recovery flow.
 * Unlike the login/register pages, this layout is specifically designed to
 * provide a reassuring and low-friction environment for users experiencing
 * access issues.
 *
 * @component
 * @returns {JSX.Element} The rendered forgot password page layout.
 */
export const ForgotPasswordPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-0 md:p-4">

            {/* Forgot Password Card Container */}
            <div className="min-h-screen md:min-h-fit w-full max-w-lg flex flex-col bg-primary-50 p-6 md:p-10 md:rounded-xl md:shadow-2xl">

                {/* Header Section: Branding & Title */}
                <div className="w-full max-w-xs md:max-w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 md:mb-8">
                    <Link to="/" className="text-primary-300 font-semibold cursor-pointer transition-colors duration-300">
                        <img className="h-10 w-auto" src="/public/logoHeader_1.svg" alt="Logo Tikal" />
                    </Link>

                    <h1 className="text-primary-300 text-3xl text-center font-bold">Restablecer contraseña</h1>
                </div>

                {/* Forgot Password Form */}
                <FormForgotPasswordComponent  />
            </div>
        </div>
    )
}