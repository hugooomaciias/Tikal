import { Link } from "react-router-dom";
import { FormLoginComponent } from "../../components/auth/FormLoginComponent.jsx";
import { GoogleIcon } from "../../assets/icons/googleIcon.jsx"
import { AppleIcon } from "../../assets/icons/appleIcon.jsx"
import { GithubIcon } from "../../assets/icons/githubIcon.jsx"

/**
 * Login Page Layout
 *
 * This component serves as the authentication gateway for returning users.
 * Like the registration page, it uses a centralized, distraction-free layout
 * to ensure users focus entirely on the credential entry process. It acts as
 * the visual container (View), delegating the complex authentication logic,
 * state management, and API interactions to the `FormLoginComponent`.
 *
 * @component
 * @returns {JSX.Element} The rendered login page layout.
 */
export const LoginPage = () => {
    const iconMap = {
        "GoogleIcon": GoogleIcon,
        "AppleIcon": AppleIcon,
        "GithubIcon": GithubIcon,
    };

    const signInOptions = [
        {
            title: "Google",
            icon: "GoogleIcon"
        },
        {
            title: "Apple",
            icon: "AppleIcon"
        },
        {
            title: "Github",
            icon: "GithubIcon"
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary p-0 md:p-4">

            {/* Login Card Container */}
            <div className="min-h-screen md:min-h-fit w-full max-w-md flex flex-col bg-primary-50 p-6 md:p-10 md:rounded-xl md:shadow-2xl">

                {/* Header Section: Branding & Title */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="text-primary-300 font-semibold cursor-pointer transition-colors duration-300">
                        <img className="h-10 w-auto" src="/public/logoHeader_1.svg" alt="Logo Tikal" />
                    </Link>

                    <h1 className="text-primary-300 text-3xl text-center font-bold">Iniciar Sesión</h1>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {/* Login Form */}
                    <FormLoginComponent  />

                    {/* Forgot Password */}
                    <div className="relative w-full flex items-center justify-center p-8">
                        <div className="absolute w-full border-primary border-t-[3px]"></div>
                        
                        <span className="relative px-3 bg-primary-50 text-primary-500 text-sm font-medium">
                            O continúa con
                        </span>
                    </div>

                    {/* SignIn options buttons */}
                    <div className="flex justify-center gap-4">
                        {signInOptions.map((option, index) => {
                            const IconComponent = iconMap[option.icon];

                            return (
                                <button key={index} type="button" title={option.title}
                                    className="btn-primary h-12 w-12 flex items-center justify-center rounded-full md:opacity-80 hover:opacity-100 transition-all duration-500 shadow-md"
                                >
                                    <IconComponent />
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Section: Link to Register */}
                    <div className="text-center mt-8 space-y-2">
                        <p className="text-quaternary-700 text-sm">
                            ¿No eres miembro de Tikal? <Link to="/register" className="text-primary-600 font-semibold transition-colors hover:text-primary-700">Regístrate</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}