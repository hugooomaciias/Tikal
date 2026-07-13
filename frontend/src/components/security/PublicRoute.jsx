/** React & Third-Party Libraries */
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

/** Contexts, Hooks & Services */
import { AuthContext } from "../../context/AuthContext";

/**
 * Public Route Component
 *
 * This component acts as a router wrapper that prevents authenticated users
 * from accessing public-only pages, such as the login or registration screens.
 * If a stored session is found, it automatically redirects the user to the
 * loading screen (which subsequently routes to the dashboard).
 *
 * @component
 * @returns {JSX.Element} Either the requested child route (Outlet) or a navigation redirection.
 */
export const PublicRoute = () => {
    // --- 1. Hooks & Contexts ---

    /**
     * Authentication Context
     *
     * Extracts the user's authentication status to determine routing permission.
     */
    const { isAuthenticated } = useContext(AuthContext);

    // --- 2. Render ---

    if (isAuthenticated) {
        return <Navigate to="/loading" replace />;
    }

    return <Outlet />;
};
