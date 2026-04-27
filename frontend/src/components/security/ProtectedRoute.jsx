/** React & Third-Party Libraries */
import React from "react";
import { Navigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useAuth } from "../../hooks/useAuth";

/** Components & Layouts */
import { LoadingPage } from "../../pages/LoadingPage";

/**
 * Protected Route Component
 *
 * This component acts as a router wrapper that prevents unauthenticated users
 * from accessing private pages, such as the dashboard or application main areas.
 * It also handles the transitional loading state during authentication checks.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {JSX.Element} props.children - The child components to render if authenticated.
 * @returns {JSX.Element} Either the requested child route, a loading screen, or a navigation redirection.
 */
export const ProtectedRoute = ({ children }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Authentication Context Hook
     *
     * Extracts the user's authentication and loading status to determine routing permission.
     */
    const { isAuthenticated, isLoading } = useAuth();

    // --- 6. Render ---

    /**
     * Handle Pending State
     *
     * If the authentication status is still being determined, display the
     * full-screen loading component.
     */
    if (isLoading) {
        return <LoadingPage />;
    }

    /**
     * Redirect Unauthenticated Users
     *
     * If the user is definitely not authenticated, block access to the private route
     * and forcibly redirect them to the login screen.
     */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    /**
     * Render Protected Route
     *
     * If an active session exists and is verified, allow the component to render its
     * child routes.
     */
    return children;
};
