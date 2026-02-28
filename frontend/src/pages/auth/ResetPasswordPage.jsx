import { Link } from "react-router-dom";
import { FormResetPasswordComponent } from "../../components/auth/FormResetPasswordComponent.jsx";

/**
 * Reset Password Page Layout
 *
 * This component represents the final step in the account recovery process.
 * Users arrive here typically via a secure tokenized link sent to their email.
 * It provides a secure, isolated environment for users to define and confirm
 * their new credentials without distractions.
 *
 * @component
 * @returns {JSX.Element} The rendered reset password page layout.
 */
export const ResetPasswordPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-0 md:p-4">

            {/* Reset Password Card Container */}
            <div className="min-h-screen md:min-h-fit w-full max-w-lg flex flex-col bg-primary-50 p-6 md:p-10 md:rounded-xl md:shadow-2xl">

                {/* Header Section: Branding & Title */}
                <div className="w-full max-w-xs md:max-w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
                    <Link to="/" className="text-primary-300 font-semibold cursor-pointer transition-colors duration-300">
                        <img className="h-10 w-auto" src="/public/logoHeader_1.svg" alt="Logo Tikal" />
                    </Link>

                    <h1 className="text-primary-300 text-3xl text-center font-bold">Restablecer contraseña</h1>
                </div>

                {/* Reset Password Form */}
                <FormResetPasswordComponent  />
            </div>
        </div>
    )
}