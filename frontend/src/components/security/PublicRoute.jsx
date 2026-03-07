/** React & Third-Party Libraries */
import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

/** Components */
import { AuthContext } from '../../context/AuthContext'

/**
 * Public Route Component
 *
 * This component acts as a router wrapper that prevents authenticated users
 * from accessing public-only pages, such as the login or registration screens.
 * If a stored session is found, it automatically redirects the user to the
 * loading screen (which subsequently routes to the dashboard).
 *
 * @component
 * @returns {JSX.Element} Either the requested child route (Outlet) or a
 * navigation redirection.
 */
export const PublicRoute = () => {
    /**
     * Authentication Context
     *
     * Extracts the user's authentication status to determine routing permission.
     */
    const { isAuthenticated } = useContext(AuthContext);

    /**
     * Redirect Authenticated Users
     *
     * If the user is already authenticated, block access to the public route
     * and forcibly redirect them to the loading gateway.
     */
    if (isAuthenticated) {
        return <Navigate to="/loading" replace />;
    }

    /**
     * Render Public Route
     *
     * If no active session exists, allow the component to render its child
     * routes (e.g., /login or /register).
     */
    return <Outlet />;
};